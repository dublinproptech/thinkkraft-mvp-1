import { z } from "zod";
import { requestHint } from "@/lib/aiHint";
import { createHint } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

const Input = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().min(1),
  sb3Ref: z.string().min(1),
  attempts: z.number().int().positive().default(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { studentId, lessonId, sb3Ref, attempts } = parsed.data;

  const ai = await requestHint(sb3Ref, lessonId, attempts);

  if (ai.result.correct) {
    return Response.json({ correct: true });
  }
  if (!ai.hint || !ai.result.diagnosis) {
    return Response.json({ correct: false, hint: null });
  }

  // Store as a pending hint; it is NOT returned to the child yet.
  const saved = await createHint({
    studentId,
    lessonId,
    diagnosis: ai.result.diagnosis,
    level: ai.hint.level,
    text: ai.hint.text,
  });

  return Response.json({ correct: false, hintId: saved.id, status: "pending" });
}
