"use client";

import { useCallback, useEffect, useState } from "react";

// What this child understands, and the one thing to do about it next.
//
// Children see words, never numbers. A probability invites a child to read it
// as a mark out of a hundred and compare it with the person next to them,
// which is not what it is and not what it is for.

type Row = { skill: string; pMastery: number; attempts: number; level: string };

type Step = {
  action: "teach" | "practice" | "review" | "advance";
  skill: string | null;
  content: {
    name: string;
    micro_lesson: { explanation: string; worked_example: string };
    practice: { prompt: string };
  } | null;
  reason: string;
  blocked?: string;
};

// The enum stored against a skill, as a child should read it.
const WORD: Record<string, string> = {
  NOT_STARTED: "not started",
  LEARNING: "needs help",
  PRACTISING: "getting there",
  MASTERED: "confident",
};

const NAME: Record<string, string> = {
  events: "Starting your project",
  sequencing: "Putting steps in order",
  motion: "Making things move",
  loops: "Repeating things",
  conditionals: "Making choices",
  variables: "Remembering numbers",
};

export default function SkillsCard({
  studentId,
  lessonId,
}: {
  studentId: string;
  lessonId: string;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/learner/${encodeURIComponent(studentId)}`);
      if (!res.ok) return;
      const body = await res.json();
      setRows(body.rows ?? []);
    } catch {
      // The skills card is not worth an error message on the workspace. A
      // child who cannot see it can still build and still get hints.
    }
  }, [studentId]);

  useEffect(() => {
    // Through a timer so the effect never sets state synchronously.
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  async function learnThis() {
    setBusy(true);
    try {
      const res = await fetch("/api/learner/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, lessonId }),
      });
      if (res.ok) {
        setStep(await res.json());
        setOpen(true);
      }
    } catch {
      // Same again: a failed suggestion is not a reason to interrupt them.
    } finally {
      setBusy(false);
    }
  }

  const known = (rows ?? []).filter((r) => r.attempts > 0);

  return (
    <section className="panel skills">
      <div className="hints-head">
        <div className="hints-who">
          <span className="hints-avatar" aria-hidden="true">
            ★
          </span>
          <span className="hints-who-text">
            <span className="hints-name">My skills</span>
            <span className="hints-sub">what you are getting good at</span>
          </span>
        </div>
        <div className="hints-actions">
          <button className="btn-solid" onClick={() => void learnThis()} disabled={busy}>
            {busy ? "Looking..." : "Learn this"}
          </button>
        </div>
      </div>

      {known.length === 0 ? (
        <p className="hint-empty">
          Nothing here yet. Press <b>Check my work</b> and this fills in as you
          build.
        </p>
      ) : (
        <ul className="skill-list">
          {known.map((r) => (
            <li key={r.skill} className="skill-row">
              <span className="skill-name">{NAME[r.skill] ?? r.skill}</span>
              <span className={`skill-level skill-${r.level.toLowerCase()}`}>
                {WORD[r.level] ?? "getting there"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && step && (
        <div className="skill-step">
          {step.action === "advance" ? (
            <p className="hint-status hint-status-good">
              Nothing to catch up on. Keep going with your project.
            </p>
          ) : step.content ? (
            <>
              <h3 className="skill-step-title">{step.content.name}</h3>
              <p className="skill-step-text">
                {step.content.micro_lesson.explanation}
              </p>
              <p className="skill-step-text skill-step-example">
                {step.content.micro_lesson.worked_example}
              </p>
              <div className="skill-task">
                <span className="thread-who">Try this</span>
                <p className="skill-step-text">{step.content.practice.prompt}</p>
              </div>
            </>
          ) : (
            // The planner decided, but the content has not been approved, so
            // there is nothing to show. Same rule as a hint.
            <p className="hint-status">
              Milo has an idea for what to work on next. Your teacher is
              checking it first.
            </p>
          )}

          <button className="btn-ghost btn-sm skill-close" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </section>
  );
}
