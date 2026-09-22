import { z } from "zod";
import { requireStudent } from "@/lib/session";
import { createHint } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

// NOTE: this route does not call the AI service. Its hint text is hard-coded
// (see below) and it duplicates /api/hints/request, which does go through the
// lib/aiHint.ts boundary and returns a real, checked hint. Nothing in the app
// calls this route. It is kept only so the endpoint does not disappear from
// under anyone mid-branch, and it should be deleted once that is confirmed.
//
// Its identity handling is fixed here regardless, because an unfixed route is
// still a reachable one.
const Input = z.object({
  lessonId: z.string().min(1),
  requestedLevel: z.number().int().min(1).max(3).default(1),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Placeholder text, not a checked hint. Deterministic correctness lives in
  // ai-service/checker.py and reaches the app through /api/hints/request.
  const { hint } = await createHint({
    studentId: who.studentId,
    lessonId: parsed.data.lessonId,
    diagnosis: "placeholder",
    level: parsed.data.requestedLevel,
    text: "Take a look at your Control blocks. Is there a way to repeat that action?",
  });

  return Response.json({ ok: true, hintId: hint.id, status: hint.status });
}
