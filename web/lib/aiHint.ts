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
