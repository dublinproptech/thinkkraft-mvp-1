"use client";

import { useState, useEffect, useRef } from "react";

// studentId is no longer passed to the server anywhere in here: every one of
// these routes reads it from the session. It stays as a prop only to know when
// the child's identity is ready, and to key the stream effect.
type Props = { studentId: string; lessonId: string; sb3Ref: string };

export default function HintPanel({ studentId, lessonId, sb3Ref }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [hints, setHints] = useState<{ id: string; text: string }[]>([]);
  const seen = useRef<Set<string>>(new Set());

  // Poll for approved hints for this child and show any new ones.
  // Live stream of approved hints via Server-Sent Events.
  // The browser opens one connection and receives each hint the moment it's approved.
  useEffect(() => {
    if (!studentId) return;

    // No studentId in the URL: the stream serves whoever the session says you
    // are, so one child cannot listen in on another's hints.
    const source = new EventSource("/api/hints/stream");

    source.onmessage = (event) => {
      const hint = JSON.parse(event.data) as { id: string; text: string };
      if (seen.current.has(hint.id)) return;
      seen.current.add(hint.id);
      setHints((prev) => [hint, ...prev]);
      setStatus(null);
    };

    source.onerror = () => {
      // The browser auto-reconnects on a dropped connection; nothing to do here.
    };

    return () => source.close();
  }, [studentId]);

  async function checkWork() {
    try {
      const next = attempts + 1;
      setAttempts(next);
      setStatus("Checking your work...");
      const res = await fetch("/api/hints/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, sb3Ref, attempts: next }),
      });
      if (!res.ok) {
        setStatus(`Error: server returned ${res.status}`);
        return;
      }
      const r = await res.json();
      if (r.correct) setStatus("Nice work! That looks right.");
      else if (r.status === "pending")
        setStatus(
          "Milo has a tip for you. Your teacher is just checking it...",
        );
      else setStatus("Keep going!");
    } catch (e) {
      setStatus(`Something went wrong: ${String(e)}`);
    }
  }

  async function emit(kind: string) {
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, kind }),
    });
  }

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="badge" style={{ marginBottom: 12 }}>
        Milo, your coding buddy
      </div>

      <div>
        <button className="btn-solid" onClick={checkWork}>
          Check my work
        </button>
      </div>

      {status && (
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          {status}
        </p>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-ghost btn-sm" onClick={() => emit("block_added")}>
          simulate: block added
        </button>
        <button className="btn-ghost btn-sm" onClick={() => emit("idle_tick")}>
          simulate: idle
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        {hints.map((h) => (
          <div
            key={h.id}
            style={{
              marginTop: 10,
              padding: "13px 15px",
              borderRadius: 12,
              border: "2px solid var(--navy)",
              background: "var(--mint)",
              color: "var(--navy)",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {h.text}
          </div>
        ))}
      </div>
    </div>
  );
}
