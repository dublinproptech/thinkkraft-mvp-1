import { z } from "zod";
import { nextStep } from "@/lib/aiHint";
import { getProfile } from "@/lib/db/mastery";
import { requireSession } from "@/lib/session";
import { targetSkillsFor } from "@/lib/skillMap";

export const dynamic = "force-dynamic";

const Input = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().min(1).optional(),
  targetSkills: z.array(z.string()).optional(),
});

// What this child should do next. The planner decides; this route only feeds
// it the stored estimates and passes the answer back.
export async function POST(req: Request) {
  const who = await requireSession();
  if (!who.ok) return who.response;

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Missing studentId." }, { status: 400 });
  }
  const { studentId, lessonId, targetSkills } = parsed.data;

  if (who.role === "STUDENT" && who.studentId !== studentId) {
    return Response.json({ error: "That is not your profile." }, { status: 403 });
  }

  const targets = targetSkills?.length
    ? targetSkills
    : lessonId
      ? targetSkillsFor(lessonId)
      : [];

  const { mastery } = await getProfile(studentId);
  const step = await nextStep(mastery, targets);
  return Response.json(step);
}
