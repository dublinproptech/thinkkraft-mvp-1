"use client";

import { useState, useEffect } from "react";

type Pending = {
  id: string;
  text: string;
  level: number;
  diagnosis: string;
  student: { displayName: string };
};

export default function TeacherConsole() {
  const [pending, setPending] = useState<Pending[]>([]);

  // The teacher's id would come from login later (Phase 7). For now, read it
  // from the URL: /teacher?teacherId=...
  const teacherId =
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("teacherId") ?? "");

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/hints/pending").then((x) => x.json());
      setPending(r.pending ?? []);
    }
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, []);

  async function approve(hintId: string) {
    await fetch("/api/hints/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintId, teacherId }),
    });
    const r = await fetch("/api/hints/pending").then((x) => x.json());
    setPending(r.pending ?? []);
  }

  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24 }}>
        Teacher console
      </span>
      <h1 style={{ fontSize: 34, margin: "14px 0 6px", color: "var(--navy)" }}>
        Hints to review
      </h1>
      <p className="muted" style={{ fontSize: 15 }}>
        Each hint waits here until you approve it.
      </p>

      <div style={{ marginTop: 20 }}>
        {pending.length === 0 && (
          <p className="muted">Nothing waiting right now.</p>
        )}
        {pending.map((h) => (
          <div key={h.id} className="card" style={{ marginBottom: 12 }}>
            <div
              className="muted"
              style={{ fontWeight: 800, color: "var(--violet)" }}
            >
              {h.student.displayName} · level {h.level} ·{" "}
              {h.diagnosis.replace(/_/g, " ")}
            </div>
            <p style={{ margin: "10px 0 14px", fontSize: 15 }}>{h.text}</p>
            <button className="btn btn-primary" onClick={() => approve(h.id)}>
              Approve and send
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
