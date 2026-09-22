"use client";

import { useState, useEffect, useRef } from "react";

// studentId is not sent to the server anywhere in here: every one of these
// routes reads it from the session. It stays as a prop only to know when the
// child's identity is ready and to key the stream effect.
//
// captureProject asks the editor for whatever the child has on screen and
// stores it, returning the stored project's ref. "Check my work" calls it, so
// the tip is about the blocks that are there now: no exporting a file by hand,
// and nothing to disable the button for.
type Hint = { id: string; text: string; level: number };

type Props = {
  studentId: string;
  lessonId: string;
  captureProject: () => Promise<string | null>;
  /** Announce a tip that a teacher has just let through. */
  onApproved: (text: string) => void;
};

// A hint that asks a question is one the child can answer. Milo's level-1
// nudges are written as questions on purpose, so this is most of them.
function isQuestion(text: string) {
  return text.trim().endsWith("?");
}

export default function HintPanel({
  studentId,
  lessonId,
  captureProject,
  onApproved,
}: Props) {
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [good, setGood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState<Hint[]>([]);
  // Tips the child has closed. The server stamps them so they stay closed on
  // any device, and the stream stops sending them; this list only covers the
  // moment between the click and the next poll.
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  // onApproved is called from inside the stream handler, which is set up once.
  // Holding it in a ref keeps the latest one without reopening the connection
  // every time the parent re-renders.
  const announce = useRef(onApproved);
  useEffect(() => {
    announce.current = onApproved;
  }, [onApproved]);

  // Live stream of approved hints via Server-Sent Events. The browser opens one
  // connection and receives each hint the moment a teacher approves it.
  useEffect(() => {
    if (!studentId) return;

    // No studentId in the URL: the stream serves whoever the session says you
    // are, so one child cannot listen in on another's hints. lessonId only
    // narrows it to the lesson on screen.
    const source = new EventSource(
      `/api/hints/stream?lessonId=${encodeURIComponent(lessonId)}`,
    );

    source.onmessage = (event) => {
      const hint = JSON.parse(event.data) as Hint & { backlog?: boolean };
      if (seen.current.has(hint.id)) return;
      seen.current.add(hint.id);

      setHints((prev) => {
        // The same wording twice is not a second tip, whatever its id.
        if (prev.some((h) => h.text === hint.text)) return prev;
        return [{ id: hint.id, text: hint.text, level: hint.level }, ...prev];
      });
      setStatus(null);
      setGood(false);

      // Only a tip that has just come through the gate is worth interrupting
      // for. Catching up on old ones when the page opens is not news.
      if (!hint.backlog) announce.current(hint.text);
    };

    source.onerror = () => {
      // The browser auto-reconnects on a dropped connection; nothing to do here.
    };

    return () => source.close();
    // Reconnect if the child moves to a different lesson, so the panel follows.
  }, [studentId, lessonId]);

  async function dismiss(id: string) {
    // Hide it at once: a child pressing the close button should see it go,
    // not wait on a round trip.
    setDismissed((prev) => [...prev, id]);
    if (replyTo === id) setReplyTo(null);
    try {
      await fetch("/api/hints/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hintId: id }),
      });
    } catch {
      // It stays closed for this session either way, and the card is not
      // worth an error message to a ten-year-old.
    }
  }

  async function checkWork() {
    setBusy(true);
    setGood(false);
    setStatus("Milo is looking at your blocks...");
    try {
      // Take the project as it is right now, rather than whatever was last
      // uploaded: a tip about stale blocks is worse than no tip.
      const sb3Ref = await captureProject();
      if (!sb3Ref) {
        setStatus(
          "Milo could not read your project. Give the editor a moment, then try again.",
        );
        return;
      }

      const next = attempts + 1;
      setAttempts(next);
      const res = await fetch("/api/hints/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, sb3Ref, attempts: next }),
      });
      if (!res.ok) {
        setStatus("Milo could not look at your project just now. Try again in a moment.");
        return;
      }
      const r = await res.json();
      if (r.correct) {
        setGood(true);
        setStatus("Nice work. That looks right.");
      } else if (r.status === "already") {
        setStatus("Milo has already told you about this one. His tip is below.");
      } else if (r.status === "pending") {
        setStatus("Milo has a tip for you. Your teacher is just checking it first.");
      } else {
        setStatus("Keep going.");
      }
    } catch {
      setStatus("Something went wrong. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(hintId: string) {
    const answer = reply.trim();
    if (!answer) return;
    setSending(true);
    try {
      const res = await fetch("/api/hints/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hintId, answer }),
      });
      if (!res.ok) {
        setStatus("Milo could not read that just now. Try again in a moment.");
        return;
      }
      const r = await res.json();
      setReplyTo(null);
      setReply("");
      setGood(false);
      // Even an answer goes through the teacher. Say so, rather than leaving a
      // child waiting for a reply that is sitting in a queue.
      setStatus(
        r.status === "already"
          ? "Milo has already answered that one. His tip is below."
          : "Milo read your answer. Your teacher is checking his reply first.",
      );
    } catch {
      setStatus("Something went wrong. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  const visible = hints.filter((h) => !dismissed.includes(h.id));

  return (
    <section className="panel hints">
      {/* The action sits at the top of the panel, above everything that can
          grow, so it never walks down the page as tips arrive. */}
      <div className="hints-head">
        <div className="hints-who">
          <span className="hints-avatar" aria-hidden="true">
            ✦
          </span>
          <span className="hints-who-text">
            <span className="hints-name">Milo</span>
            <span className="hints-sub">your coding buddy</span>
          </span>
        </div>

        <div className="hints-actions">
          {visible.length > 0 && (
            <span className="hints-count">
              {visible.length} tip{visible.length === 1 ? "" : "s"}
            </span>
          )}
          <button className="btn-solid" onClick={checkWork} disabled={busy}>
            {busy ? "Checking..." : "Check my work"}
          </button>
        </div>
      </div>

      {status && (
        <p
          className={good ? "hint-status hint-status-good" : "hint-status"}
          role="status"
        >
          {status}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="hint-empty">
          No tips yet. Press <b>Check my work</b> whenever you want Milo to look
          at your blocks, and he will also say something if you get stuck. Your
          teacher reads every tip before it reaches you.
        </p>
      ) : (
        <div className="hint-list">
          {visible.map((h, i) => (
            <div
              key={h.id}
              className={i === 0 ? "hint-card hint-card-latest" : "hint-card"}
            >
              <div className="hint-row">
                <p className="hint-text">{h.text}</p>
                <button
                  className="hint-close"
                  onClick={() => void dismiss(h.id)}
                  aria-label="Close this tip"
                  title="Close this tip"
                >
                  ×
                </button>
              </div>

              {/* A hint that asked a question deserves somewhere to answer it. */}
              {isQuestion(h.text) && replyTo !== h.id && (
                <button
                  className="btn-ghost btn-sm hint-answer"
                  onClick={() => {
                    setReplyTo(h.id);
                    setReply("");
                  }}
                >
                  Answer Milo
                </button>
              )}

              {replyTo === h.id && (
                <div className="hint-reply">
                  <label className="hint-reply-label" htmlFor={`reply-${h.id}`}>
                    Tell Milo what you think
                  </label>
                  <textarea
                    id={`reply-${h.id}`}
                    className="input hint-reply-input"
                    // The child just asked for this box. Put the cursor in it,
                    // which also brings it into view inside the scrolling list.
                    autoFocus
                    value={reply}
                    maxLength={300}
                    rows={2}
                    placeholder="I think I need a block that..."
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div className="hint-reply-actions">
                    <button
                      className="btn-solid btn-sm"
                      onClick={() => sendReply(h.id)}
                      disabled={sending || reply.trim().length === 0}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => setReplyTo(null)}
                      disabled={sending}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
