import { z } from "zod";
import { requireStudent } from "@/lib/session";
import { upsertProgress } from "@/lib/db/progress";

export const dynamic = "force-dynamic";

const Input = z.object({
  lessonId: z.string().min(1, "lessonId is required"),
  completed: z.boolean().default(false),
  blocksUsed: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Any studentId in the body is ignored; the session decides whose progress
  // this is.
  const progress = await upsertProgress({
    studentId: who.studentId,
    ...parsed.data,
  });

  return Response.json({ progress });
}
