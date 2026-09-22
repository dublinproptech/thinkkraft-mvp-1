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
