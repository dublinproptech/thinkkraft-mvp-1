import { z } from "zod";
import { requestHint } from "@/lib/aiHint";
import { createHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";
import { projectBelongsToStudent } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

// studentId is no longer part of the input: it comes from the session.
// Otherwise a child could request hints as, and file hints against, another child.
const Input = z.object({
  lessonId: z.string().min(1),
  sb3Ref: z.string().min(1),
  attempts: z.number().int().positive().default(1),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { lessonId, sb3Ref, attempts } = parsed.data;

  // sb3Ref names a file on disk. Confirm it is this child's own project before
  // reading it, so the ref cannot be used to have the AI service read someone
  // else's work.
  const owns = await projectBelongsToStudent(sb3Ref, who.studentId);
  if (!owns) {
    return Response.json({ error: "Unknown project." }, { status: 404 });
  }

  const ai = await requestHint(sb3Ref, lessonId, attempts);

  if (ai.result.correct) {
    return Response.json({ correct: true });
  }
  if (!ai.hint || !ai.result.diagnosis) {
    return Response.json({ correct: false, hint: null });
  }

  // Store as a pending hint; it is NOT returned to the child yet.
  const saved = await createHint({
    studentId: who.studentId,
    lessonId,
    diagnosis: ai.result.diagnosis,
    level: ai.hint.level,
    text: ai.hint.text,
  });

  return Response.json({ correct: false, hintId: saved.id, status: "pending" });
}
