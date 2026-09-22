import { z } from "zod";
import { dismissHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// A child closing a tip they have read. studentId comes from the session, so
// the id in the body can only ever reach one of their own hints.
const Input = z.object({ hintId: z.string().min(1) });

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const done = await dismissHint(parsed.data.hintId, who.studentId);
  if (!done) return Response.json({ error: "Unknown hint." }, { status: 404 });

  return Response.json({ ok: true });
}
