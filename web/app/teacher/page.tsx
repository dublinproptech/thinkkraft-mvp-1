"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import AppBar from "../components/AppBar";

// A hint waiting on a teacher. The queue is every PROPOSED hint, reactive and
// proactive alike: both go through the same gate before a child sees them.
type PendingHint = {
  id: string;
  studentId: string;
  lessonId: string;
  diagnosis: string;
  level: number;
  text: string;
  createdAt: string;
  student: { displayName: string } | null;
  // Set when this hint is Milo's reply to one the child answered.
  childAnswer: string | null;
  answeredHint: { text: string; level: number } | null;
};

// A hint that reached a child with no teacher online. It cannot be un-sent,
// but it can be read, which is the point of recording it.
type AutoHint = {
  id: string;
  text: string;
  lessonId: string;
  level: number;
  autoApprovedAt: string;
  childAnswer: string | null;
  student: { displayName: string } | null;
};

type Progress = {
  id: string;
  completed: boolean;
  blocksUsed: number;
  updatedAt: string;
  student: { id: string; displayName: string } | null;
  lesson: { title: string | null; goal: string; orderNo: number } | null;
};

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [pending, setPending] = useState<PendingHint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onDuty, setOnDuty] = useState<number | null>(null);
  const [auto, setAuto] = useState<AutoHint[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  // middleware.ts already keeps non-teachers off this page, so there is no
  // client-side redirect here. This only decides what to render.
  const isTeacher = session?.user?.role === "TEACHER";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/hints/pending");
      if (!res.ok) {
        setError("Could not load the approval queue.");
        return;
      }
      const data = await res.json();
      setPending(data.pending ?? []);
      // Loading the queue is also the heartbeat that says a teacher is here,
      // so this number includes whoever is reading it right now.
      setOnDuty(typeof data.teachersOnline === "number" ? data.teachersOnline : null);
      setError(null);

      // What went out unsupervised, and where each child has got to. Neither
      // is urgent, so a failure here is not worth an error on the queue.
      const [a, p] = await Promise.all([
        fetch("/api/hints/auto-approved").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/progress/all").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (a?.hints) setAuto(a.hints);
      if (p?.progress) setProgress(p.progress);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isTeacher) return;
    // Hints arrive while the teacher is looking at the page, so poll. The first
    // fetch goes through the same timer callback rather than running in the
    // effect body, so the effect never sets state synchronously.
    const tick = () => void load();
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 5000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [isTeacher, load]);

  async function decide(hintId: string, action: "approve" | "reject") {
    setBusyId(hintId);
    setError(null);
    try {
      const res = await fetch(`/api/hints/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hintId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : `That ${action} did not go through.`);
        await load();
        return;
      }
      // Drop it from the queue straight away; the poll will confirm.
      setPending((prev) => prev.filter((h) => h.id !== hintId));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  if (status === "loading" || (isTeacher && isLoading)) {
    return (
      <>
        <AppBar />
        <main className="shell">
          <p>Loading dashboard...</p>
        </main>
      </>
    );
  }

  if (!isTeacher) return null;

  return (
    <>
      <AppBar />

      <main className="shell">
      <div className="page-head">
        <h1>Hint approvals</h1>
        {/* The promise the product makes depends on somebody being here, so
            say plainly which of the two situations is in force. */}
        <p>
          {onDuty === null
            ? "Nothing reaches a child until you approve it."
            : onDuty > 1
              ? `Nothing reaches a child until it is approved. ${onDuty} teachers are on duty.`
              : "Nothing reaches a child until you approve it. You are the only teacher on duty, so if you close this page, hints will go straight to children."}
        </p>
      </div>

      {error && (
        <p className="notice notice-error queue-error">
          {error}
        </p>
      )}

      {pending.length === 0 ? (
        <div className="panel empty">
          <h3>All caught up</h3>
          <p>No hints are waiting for review.</p>
        </div>
      ) : (
        <div className="queue">
          {pending.map((hint) => {
            const proactive = hint.diagnosis.startsWith("proactive:");
            return (
              <div
                key={hint.id}
                // Proactive nudges and hints the child asked for read very
                // differently to a teacher, so mark which is which.
                className={
                  proactive ? "panel queue-card queue-proactive" : "panel queue-card"
                }
              >
                <div className="queue-row">
                  <div className="queue-body">
                    <h3 className="queue-name">
                      {hint.student?.displayName ?? "Unknown student"}
                    </h3>
                    <p className="muted queue-meta">
                      <b>Lesson:</b> {hint.lessonId} · <b>Level:</b> {hint.level} ·{" "}
                      <b>
                        {hint.childAnswer
                          ? "Reply"
                          : proactive
                            ? "Proactive"
                            : "Requested"}
                      </b>
                    </p>
                    <p className="muted queue-meta queue-meta-last">
                      <b>Diagnosis:</b> {hint.diagnosis.replace("proactive:", "")}
                    </p>

                    {/* A follow-up is approved with the exchange in view: what
                        Milo asked, what the child wrote back, and only then
                        what he proposes saying. Reading the reply on its own
                        would mean approving half a conversation. */}
                    {hint.childAnswer && (
                      <div className="thread">
                        {hint.answeredHint && (
                          <div className="thread-turn">
                            <span className="thread-who">Milo asked</span>
                            <p className="thread-text">{hint.answeredHint.text}</p>
                          </div>
                        )}
                        <div className="thread-turn thread-child">
                          <span className="thread-who">
                            {hint.student?.displayName ?? "The child"} answered
                          </span>
                          <p className="thread-text">{hint.childAnswer}</p>
                        </div>
                      </div>
                    )}

                    <div className="queue-text">
                      {hint.childAnswer && (
                        <span className="thread-who">Milo would say</span>
                      )}
                      {hint.text}
                    </div>
                  </div>

                  <div className="queue-actions">
                    <button
                      onClick={() => decide(hint.id, "approve")}
                      disabled={busyId === hint.id}
                      className="btn-solid btn-sm queue-btn"
                    >
                      {busyId === hint.id ? "Saving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => decide(hint.id, "reject")}
                      disabled={busyId === hint.id}
                      className="btn-danger btn-sm queue-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sent while nobody was watching. Listed after the queue because the
          queue is the thing that still needs a decision; this is a record. */}
      {auto.length > 0 && (
        <section className="panel section-gap">
          <h2 className="panel-title">Sent without approval</h2>
          <p className="muted panel-note">
            These reached a child because no teacher was on duty at the time.
            They cannot be taken back, but they are here to be read.
          </p>
          <div className="hint-list">
            {auto.map((h) => (
              <div key={h.id} className="hint-card">
                <span className="thread-who">
                  {h.student?.displayName ?? "Unknown"} · {h.lessonId} · level{" "}
                  {h.level} · {new Date(h.autoApprovedAt).toLocaleString()}
                </span>
                {h.childAnswer && (
                  <p className="thread-text auto-answer">
                    They wrote: {h.childAnswer}
                  </p>
                )}
                <p className="hint-text">{h.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Where each child has got to, written automatically every time one of
          them presses Check my work. */}
      <section className="panel section-gap">
        <h2 className="panel-title">Progress</h2>
        {progress.length === 0 ? (
          <p className="muted panel-note">
            Nothing yet. A row appears here the first time a child checks their
            work on a lesson.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Lesson</th>
                  <th>Blocks</th>
                  <th>State</th>
                  <th>Last checked</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((p) => (
                  <tr key={p.id}>
                    <td className="table-main">
                      {p.student?.displayName ?? "Unknown"}
                    </td>
                    <td>{p.lesson?.title ?? p.lesson?.goal ?? "-"}</td>
                    <td className="table-num">{p.blocksUsed}</td>
                    <td>
                      <span className={p.completed ? "pill pill-on" : "pill"}>
                        {p.completed ? "Done" : "In progress"}
                      </span>
                    </td>
                    <td className="table-num">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </main>
    </>
  );
}
