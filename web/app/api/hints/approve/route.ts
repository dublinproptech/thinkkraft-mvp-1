import { z } from "zod";
import { approveHint } from "@/lib/db/hints";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

// The approval gate. A hint reaches a child only by passing through here.
// teacherId is never accepted from the request: it comes from the session, so
// the record of who approved a hint cannot be forged.
const Input = z.object({
  hintId: z.string().min(1),
});

export async function POST(req: Request) {
  const who = await requireTeacher();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // who.teacherId is the Teacher row, which is what approvedById points at.
  // who.userId would be the User row and would fail the foreign key.
  const updated = await approveHint(parsed.data.hintId, who.teacherId);
  if (!updated) {
    return Response.json(
      { error: "That hint is not awaiting approval." },
      { status: 409 },
    );
  }

  return Response.json({ status: updated.status });
}
