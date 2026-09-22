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

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [pending, setPending] = useState<PendingHint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
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
        <p>Nothing reaches a child until you approve it.</p>
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
      </main>
    </>
  );
}
