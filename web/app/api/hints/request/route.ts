import { z } from "zod";
import { requestHint } from "@/lib/aiHint";
import { createHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";
import { projectBelongsToStudent } from "@/lib/db/projects";
import { updateMastery } from "@/lib/aiHint";
import { applyUpdate, evidenceHistory, recordEvidenceRows } from "@/lib/db/mastery";
import { skillForDiagnosis, targetSkillsFor } from "@/lib/skillMap";

export const dynamic = "force-dynamic";

// studentId is no longer part of the input: it comes from the session.
// Otherwise a child could request hints as, and file hints against, another child.
const Input = z.object({
  lessonId: z.string().min(1),
  sb3Ref: z.string().min(1),
  attempts: z.number().int().positive().default(1),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { lessonId, sb3Ref, attempts } = parsed.data;

  // sb3Ref names a file on disk. Confirm it is this child's own project before
  // reading it, so the ref cannot be used to have the AI service read someone
  // else's work.
  const owns = await projectBelongsToStudent(sb3Ref, who.studentId);
  if (!owns) {
    return Response.json({ error: "Unknown project." }, { status: 404 });
  }

  try {
    const ai = await requestHint(sb3Ref, lessonId, attempts);

    // SAFETY CATCH: If the AI returns an error or empty result, log it and return gracefully
    if (!ai || !ai.result) {
      console.error("❌ AI Service failed to return a valid result. What we got:", ai);
      return Response.json({ correct: false, hint: null, error: "AI failed" }, { status: 502 });
    }

    // Record what this check says about the child's skills, then update the
    // estimate. Wrapped so a learner-model failure cannot cost the child their
    // hint: this is a side record, not the thing they asked for. The response
    // shape below is unchanged.
    await recordEvidence({
      studentId: who.studentId,
      lessonId,
      correct: ai.result.correct,
      diagnosis: ai.result.diagnosis,
      hintLevel: ai.hint?.level ?? 0,
    }).catch((e) => console.error("mastery not updated:", e));

    if (ai.result.correct) {
      return Response.json({ correct: true });
    }
    if (!ai.hint || !ai.result.diagnosis) {
      return Response.json({ correct: false, hint: null });
    }

    // Store as a pending hint; it is NOT returned to the child yet.
    const { hint, duplicate } = await createHint({
      studentId: who.studentId,
      lessonId,
      diagnosis: ai.result.diagnosis,
      level: ai.hint.level,
      text: ai.hint.text,
    });

    return Response.json({
      correct: false,
      hintId: hint.id,
      status: duplicate ? (hint.status === "APPROVED" ? "already" : "pending") : "pending",
      duplicate,
    });
  } catch (error) {
    // If Prisma, the Database, or the Fetch call fails, catch it here!
    console.error("❌ Backend crash in request route:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
// A check of a child's lesson work, as evidence about one skill.
//
// Correct means they met the lesson goal, which is evidence for the skill the
// lesson is about. Incorrect means the checker named a gap, which is evidence
// against the skill that gap belongs to. Either way it is one skill, not all
// of them: a child who cannot loop has not thereby shown anything about
// variables.
async function recordEvidence(args: {
  studentId: string;
  lessonId: string;
  correct: boolean;
  diagnosis: string | null;
  hintLevel: number;
}) {
  const { studentId, lessonId, correct, diagnosis, hintLevel } = args;

  const skill = correct
    ? targetSkillsFor(lessonId)[0]
    : skillForDiagnosis(diagnosis);

  // Nothing to say about any particular skill, so say nothing.
  if (!skill) return;

  // Write what happened first, then recompute the estimate from everything on
  // record for that skill. Adjusting the stored estimate in place loses one of
  // two updates that land together; recomputing from the history does not.
  await recordEvidenceRows(studentId, [
    { skill, correct, hintLevel, source: "check" },
  ]);

  const history = await evidenceHistory(studentId, [skill]);
  const { posterior } = await updateMastery({}, history);
  await applyUpdate({ studentId, posterior });
}
