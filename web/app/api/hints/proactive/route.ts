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

  const created = [];
  for (const h of r.hints ?? []) {
    const saved = await createHint({
      studentId: who.studentId,
      lessonId: parsed.data.lessonId,
      diagnosis: `proactive:${h.reason}`,
      level: h.level,
      text: h.text,
    });
    created.push(saved.id);
  }
  return Response.json({ created });
}
