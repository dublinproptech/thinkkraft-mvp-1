import { z } from "zod";
import { requestHint } from "@/lib/aiHint";
import { createHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";
import { projectBelongsToStudent } from "@/lib/db/projects";
import { updateMastery } from "@/lib/aiHint";
import { applyUpdate, evidenceHistory, recordEvidenceRows } from "@/lib/db/mastery";
import { skillForDiagnosis, targetSkillsFor } from "@/lib/skillMap";
import { upsertProgress } from "@/lib/db/progress";

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

    // Two separate records, both taken from this one check, neither of which
    // the child asked for and neither of which is worth failing their hint
    // over. Progress is where they are in the lesson. Evidence is what the
    // check says about the underlying skill. The response shape is unchanged.

    // Every check is a reading of where the child is, so record it. This is
    // the one moment the app knows both whether the lesson is met and how much
    // the child has built, and it costs the child nothing: they pressed a
    // button they were pressing anyway.
    await upsertProgress({
      studentId: who.studentId,
      lessonId,
      completed: ai.result.correct,
      blocksUsed: ai.signals?.block_count ?? 0,
    }).catch((e) => {
      // A progress row is not worth failing the child's hint over.
      console.error("progress not saved:", e);
    });

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
    const { hint, duplicate, autoApproved } = await createHint({
      studentId: who.studentId,
      lessonId,
      diagnosis: ai.result.diagnosis,
      level: ai.hint.level,
      text: ai.hint.text,
    });

    return Response.json({
      correct: false,
      hintId: hint.id,
      // "sent" means no teacher was watching the queue, so it went straight
      // to the child rather than waiting for an approval nobody was there to
      // give.
      status: autoApproved
        ? "sent"
        : duplicate && hint.status === "APPROVED"
          ? "already"
          : "pending",
      duplicate,
      autoApproved,
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
