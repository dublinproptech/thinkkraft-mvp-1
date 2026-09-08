"use client";

import { useState, useEffect, useRef } from "react";

type Props = { studentId: string; lessonId: string; sb3Ref: string };

export default function HintPanel({ studentId, lessonId, sb3Ref }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [hints, setHints] = useState<{ id: string; text: string }[]>([]);
  const seen = useRef<Set<string>>(new Set());

  // Poll for approved hints for this child and show any new ones.
  useEffect(() => {
    if (!studentId) return; // nothing to poll for until we know the student

    const timer = setInterval(async () => {
      const r = await fetch(
        `/api/hints/for-student?studentId=${studentId}`,
      ).then((x) => x.json());
      const fresh = (r.hints ?? []).filter(
        (h: { id: string }) => !seen.current.has(h.id),
      );
      if (fresh.length) {
        fresh.forEach((h: { id: string }) => seen.current.add(h.id));
        setHints((prev) => [...fresh, ...prev]);
        setStatus(null);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [studentId]);

  async function checkWork() {
    const next = attempts + 1;
    setAttempts(next);
    setStatus("Checking your work...");
    const r = await fetch("/api/hints/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, lessonId, sb3Ref, attempts: next }),
    }).then((x) => x.json());

    if (r.correct) setStatus("Nice work! That looks right.");
    else if (r.status === "pending")
      setStatus("Milo has a tip for you. Your teacher is just checking it...");
    else setStatus("Keep going!");
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
