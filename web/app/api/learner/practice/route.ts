import { z } from "zod";
import { checkPractice, skillContent, updateMastery } from "@/lib/aiHint";
import { applyUpdate, evidenceHistory, recordEvidenceRows } from "@/lib/db/mastery";
import { projectBelongsToStudent } from "@/lib/db/projects";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// A child's attempt at a practice task the planner set.
//
// Checked by the same deterministic checker as their lesson work, against the
// lesson whose requirements match the skill being practised. Passing is
// evidence for that skill, failing is evidence against it, and either way it
// is recorded with source "practice" so a teacher can tell the two apart.
// No lessonId: a practice task belongs to a skill, not to a lesson, and is
// checked against the signals that skill's task asks for. Checking it against
// a lesson meant a motion task was judged by whether it contained a loop.
const Input = z.object({
  skill: z.string().min(1),
  sb3Ref: z.string().min(1),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Missing practice details." }, { status: 400 });
  }
  const { skill, sb3Ref } = parsed.data;

  // Same ownership check as a hint request: the ref names a file on disk, so
  // it must be this child's own before the AI service is asked to read it.
  if (!(await projectBelongsToStudent(sb3Ref, who.studentId))) {
    return Response.json({ error: "Unknown project." }, { status: 404 });
  }

  // The signals this skill's own practice task asks for. Looked up by name,
  // not via the planner: the planner answers "what next", which may be a
  // different skill entirely, and checking a motion task against the events
  // task's signals passes a project that has no movement in it.
  const content = await skillContent(skill);
  const required = content?.practice?.required_signals ?? [];
  if (!required.length) {
    return Response.json(
      { error: "That skill has no practice task available." },
      { status: 409 },
    );
  }

  const ai = await checkPractice(sb3Ref, required);
  const passed = Boolean(ai?.result?.correct);

  // Practice is unaided by definition: the child was given a task, not a hint,
  // so there is no hint level to discount the success by.
  await recordEvidenceRows(who.studentId, [
    { skill, correct: passed, hintLevel: 0, source: "practice" },
  ]);

  const history = await evidenceHistory(who.studentId, [skill]);
  const { posterior, levels } = await updateMastery({}, history);
  await applyUpdate({ studentId: who.studentId, posterior });

  return Response.json({
    passed,
    missing: ai.result.missing,
    skill,
    pMastery: posterior[skill],
    level: levels[skill],
  });
}
