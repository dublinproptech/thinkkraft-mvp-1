import { z } from "zod";
import { createHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";

const AI = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

// Collects any proactive nudges the governor allowed for this child and files
// them as PROPOSED. Same gate as every other hint: a teacher still has to pass
// them before the child sees anything.
const Input = z.object({
  lessonId: z.string().min(1),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const r = await fetch(`${AI}/proactive/${who.studentId}`).then((x) => x.json());

  // A nudge the child already has waiting is not filed a second time, so
  // "created" holds only what is genuinely new for the teacher to look at.
  const created = [];
  // Those that went straight to the child because nobody was watching.
  const sent: string[] = [];
  for (const h of r.hints ?? []) {
    const { hint, duplicate, autoApproved } = await createHint({
      studentId: who.studentId,
      lessonId: parsed.data.lessonId,
      diagnosis: `proactive:${h.reason}`,
      level: h.level,
      text: h.text,
    });
    if (!duplicate) {
      created.push(hint.id);
      if (autoApproved) sent.push(hint.id);
    }
  }
  return Response.json({ created, sent });
}
