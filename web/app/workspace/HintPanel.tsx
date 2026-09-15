"use client";

import { useState, useEffect, useRef } from "react";

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

    const source = new EventSource(`/api/hints/stream?studentId=${studentId}`);

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
        body: JSON.stringify({ studentId, lessonId, sb3Ref, attempts: next }),
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
      body: JSON.stringify({ studentId, lessonId, kind }),
    });
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="tag" style={{ marginBottom: 8 }}>
        Milo, your coding buddy
      </div>
      <button className="btn btn-primary" onClick={checkWork}>
        Check my work
      </button>

      {status && (
        <p className="muted" style={{ marginTop: 12 }}>
          {status}
        </p>
      )}
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={() => emit("block_added")}
        >
          simulate: block added
        </button>
        <button className="btn btn-secondary" onClick={() => emit("idle_tick")}>
          simulate: idle
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {hints.map((h) => (
          <div
            key={h.id}
            className="badge"
            style={{
              display: "block",
              marginTop: 8,
              padding: "12px 14px",
              borderRadius: 14,
            }}
          >
            {h.text}
          </div>
        ))}
      </div>
    </div>
  );
}
