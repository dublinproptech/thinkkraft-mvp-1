import { z } from "zod";
import { rejectHint } from "@/lib/db/hints";
import { requireTeacher } from "@/lib/session";
import { markTeacherSeen } from "@/lib/db/presence";

export const dynamic = "force-dynamic";

// The other half of the gate. A rejected hint is never delivered, and we record
// which teacher made the call, the same way approval does.
const Input = z.object({
  hintId: z.string().min(1),
});

export async function POST(req: Request) {
  const who = await requireTeacher();
  if (!who.ok) return who.response;

  // A teacher deciding on a hint is unambiguously on duty. The queue's poll
  // is the usual heartbeat, but relying on it alone means a teacher who acts
  // between polls, or whose tab the browser has throttled, can read as absent
  // and let the next hint through unsupervised.
  await markTeacherSeen(who.teacherId).catch(() => {});

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await rejectHint(parsed.data.hintId, who.teacherId);
  if (!updated) {
    return Response.json(
      { error: "That hint is not awaiting approval." },
      { status: 409 },
    );
  }

  return Response.json({ status: updated.status });
}
