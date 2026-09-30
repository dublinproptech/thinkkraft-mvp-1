"use client";

import { useCallback, useEffect, useState } from "react";

// Where every child is, and what the planner would do about each of them.
//
// The reason is the point of this table. A teacher should be able to read why
// the system wants to teach a particular thing and disagree with it, which is
// only possible because the decision is made in code rather than by a model.

type Row = { skill: string; level: string; attempts: number };
type Student = {
  studentId: string;
  displayName: string;
  rows: Row[];
  next: { action: string; skill: string | null; reason: string } | null;
};

const WORD: Record<string, string> = {
  NOT_STARTED: "not started",
  LEARNING: "needs help",
  PRACTISING: "getting there",
  MASTERED: "confident",
};

export default function SkillsOverview() {
  const [data, setData] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/learner/overview");
      if (!res.ok) {
        setError("Could not load the skills overview.");
        return;
      }
      const body = await res.json();
      setData(body.students ?? []);
      setError(null);
    } catch {
      setError("Could not reach the server.");
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  if (error) {
    return (
      <section className="panel section-gap">
        <h2 className="panel-title">Skills</h2>
        <p className="muted panel-note">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="panel section-gap">
        <h2 className="panel-title">Skills</h2>
        <p className="muted panel-note">Loading...</p>
      </section>
    );
  }

  return (
    <section className="panel section-gap">
      <h2 className="panel-title">Skills</h2>
      <p className="muted panel-note">
        What each child understands, and what the system would teach next. The
        reason is worked out in code, not by the AI, so you can disagree with it.
      </p>

      {data.length === 0 ? (
        <p className="muted panel-note">
          Nothing yet. This fills in as children check their work.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Skills</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.studentId}>
                  <td className="table-main">{s.displayName}</td>
                  <td>
                    {s.rows.length === 0 ? (
                      <span className="muted">no evidence yet</span>
                    ) : (
                      <div className="skill-chips">
                        {s.rows.map((r) => (
                          <span
                            key={r.skill}
                            className={`skill-level skill-${r.level.toLowerCase()}`}
                          >
                            {r.skill}: {WORD[r.level] ?? r.level}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {s.next ? (
                      <>
                        <span className="table-main">{s.next.action}</span>
                        {s.next.skill ? ` ${s.next.skill}` : ""}
                        <span className="table-sub">{s.next.reason}</span>
                      </>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
