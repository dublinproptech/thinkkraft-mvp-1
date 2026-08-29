"use client";

import { useEffect, useState } from "react";

type Course = { id: string; title: string };

export default function EnrolPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [child, setChild] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setResult(null);
    if (!name || !email || !child) {
      setError("Please fill in every field.");
      return;
    }
    try {
      // 1. Create the parent.
      const p = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      }).then((r) => r.json());
      if (p.error)
        throw new Error(
          typeof p.error === "string" ? p.error : "parent details invalid",
        );

      // 2. Create the student under that parent.
      const s = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: child,
          ageBand: "9-13",
          parentId: p.parent.id,
        }),
      }).then((r) => r.json());

      // 3. Enrol into the seeded cohort.
      const e = await fetch("/api/enrolments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: s.student.id,
          cohortId: "cohort-autumn",
        }),
      }).then((r) => r.json());
      if (e.error) throw new Error(e.error);

      setResult(`Enrolled ${child}. Student id: ${s.student.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24 }}>
        Phase 1 · enrol
      </span>
      <h1 style={{ fontSize: 36, margin: "14px 0 18px", color: "var(--navy)" }}>
        Enrol a child
      </h1>

      <div className="card" style={{ maxWidth: 460 }}>
        <label className="muted">Parent name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inp}
        />
        <label className="muted">Parent email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inp}
        />
        <label className="muted">Child name</label>
        <input
          value={child}
          onChange={(e) => setChild(e.target.value)}
          style={inp}
        />
        <button
          className="btn btn-primary"
          style={{ marginTop: 14 }}
          onClick={submit}
        >
          Enrol
        </button>

        {error && (
          <p style={{ color: "var(--coral)", fontWeight: 700, marginTop: 14 }}>
            {error}
          </p>
        )}
        {result && (
          <p style={{ color: "var(--navy)", fontWeight: 700, marginTop: 14 }}>
            {result}
          </p>
        )}
      </div>
    </main>
  );
}

const inp: React.CSSProperties = {
  display: "block",
  width: "100%",
  margin: "6px 0 14px",
  padding: "10px 12px",
  borderRadius: 12,
  border: "2px solid var(--line)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
};
