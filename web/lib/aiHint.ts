import { readFile } from "fs/promises";
import path from "path";

const AI = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const DIR = path.join(process.cwd(), "storage", "projects");

export async function requestHint(
  sb3Ref: string,
  lessonId: string,
  attempts: number,
) {
  const bytes = await readFile(path.join(DIR, sb3Ref));

  const form = new FormData();
  form.append("file", new Blob([bytes]), sb3Ref);

  const url = `${AI}/parse?lesson_id=${encodeURIComponent(lessonId)}&attempts=${attempts}`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  return res.json() as Promise<{
    // The parsed shape of the project. Correctness comes from the checker, but
    // the raw counts are what progress is recorded from.
    signals?: { block_count: number; [k: string]: unknown };
    result: { correct: boolean; diagnosis: string | null };
    hint: { level: number; text: string } | null;
  }>;
}

// The child answered a hint that asked them a question. The AI service picks
// the next rung of the same ladder; the answer only colours the wording. What
// comes back is a proposed hint like any other, not a reply straight to the child.
export async function requestFollowup(
  diagnosis: string,
  previousLevel: number,
  answer: string,
) {
  const res = await fetch(`${AI}/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diagnosis, previousLevel, answer }),
  });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  return res.json() as Promise<{
    hint: { level: number; text: string } | null;
  }>;
}

// The learner model. Deterministic on the service side: no language model is
// involved in working out what a child understands, and none may be.
// The teaching content for one named skill. Not the planner: the planner may
// answer with a different skill because it redirects to the root cause, so
// anything needing a named skill's content has to ask for it by name.
export async function skillContent(skill: string) {
  const res = await fetch(`${AI}/content/${encodeURIComponent(skill)}`);
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  const body = (await res.json()) as {
    content: {
      skill: string;
      name: string;
      micro_lesson: { explanation: string; worked_example: string };
      practice: { prompt: string; required_signals: string[] };
      approved: boolean;
    } | null;
  };
  return body.content;
}

// A practice attempt, checked against the skill's own required signals rather
// than a lesson's. Deterministic on the service side.
export async function checkPractice(sb3Ref: string, requiredSignals: string[]) {
  const bytes = await readFile(path.join(DIR, sb3Ref));
  const form = new FormData();
  form.append("file", new Blob([bytes]), sb3Ref);

  const url = `${AI}/practice/check?required_signals=${encodeURIComponent(requiredSignals.join(","))}`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  return res.json() as Promise<{
    signals: Record<string, unknown>;
    result: { correct: boolean; missing: string[] };
  }>;
}

export async function updateMastery(
  prior: Record<string, number>,
  evidence: { skill: string; correct: boolean; hint_level: number }[],
) {
  const res = await fetch(`${AI}/learner/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prior, evidence }),
  });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  return res.json() as Promise<{
    posterior: Record<string, number>;
    levels: Record<string, string>;
  }>;
}

// What to teach this child next. The planner decides in code; the model may
// reword the explanation, which is the same arrangement the hints have.
export async function nextStep(
  mastery: Record<string, number>,
  targetSkills: string[],
  reword = false,
) {
  const res = await fetch(`${AI}/learner/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mastery, target_skills: targetSkills, reword }),
  });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  return res.json() as Promise<{
    action: "teach" | "practice" | "review" | "advance";
    skill: string | null;
    content: {
      skill: string;
      name: string;
      micro_lesson: { explanation: string; worked_example: string };
      practice: { prompt: string; required_signals: string[] };
      approved: boolean;
    } | null;
    reason: string;
    blocked?: string;
  }>;
}

export async function sendActivity(
  studentId: string,
  lessonId: string,
  kind: string,
) {
  await fetch(`${AI}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, lessonId, kind }),
  });
}
