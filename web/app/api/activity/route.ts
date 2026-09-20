import { z } from "zod";
import { sendActivity } from "@/lib/aiHint";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// Activity feeds the stuck-detector. studentId comes from the session so that
// one child's events cannot be attributed to another, which would skew both the
// monitor and the governor's per-student cooldown.
const Input = z.object({
  lessonId: z.string().min(1),
  kind: z.enum(["block_added", "block_deleted", "ran_project", "idle_tick"]),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await sendActivity(who.studentId, parsed.data.lessonId, parsed.data.kind);
  return Response.json({ ok: true });
}
