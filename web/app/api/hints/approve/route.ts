import { z } from "zod";
import { approveHint } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

const Input = z.object({
  hintId: z.string().min(1),
  teacherId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await approveHint(parsed.data.hintId, parsed.data.teacherId);
  return Response.json({ status: updated.status });
}
