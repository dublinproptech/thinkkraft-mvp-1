import { z } from "zod";
import { requestFollowup } from "@/lib/aiHint";
import { createHint, hintForStudent } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";
import { classify } from "@/lib/scope";

export const dynamic = "force-dynamic";

// A child answering a hint that asked them a question.
//
// What comes back is not a reply to the child. It is the next rung of the same
// ladder, filed as PROPOSED like every other hint, so a teacher still reads it
// before the child sees it. The approval gate is not bypassed by a conversation.
//
// The answer is a child's free text, so it is capped here before it goes any
// further, and studentId comes from the session as always.
const Input = z.object({
  hintId: z.string().min(1),
  answer: z.string().trim().min(1).max(300),
});

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { hintId, answer } = parsed.data;

  // The hint id came from the browser, so check it is this child's own before
  // reading anything off it.
  const hint = await hintForStudent(hintId, who.studentId);
  if (!hint) {
    return Response.json({ error: "Unknown hint." }, { status: 404 });
  }
  // Only a hint the child can actually see is one they can answer.
  if (hint.status !== "APPROVED") {
    return Response.json({ error: "That tip is not available." }, { status: 409 });
  }

  // Decided here, not by the model. A question about football is answered
  // plainly, nothing is sent to the AI service, and no hint is filed: there is
  // no Scratch gap to teach, so there is nothing for a teacher to approve.
  const scope = classify(answer);
  if (!scope.inScope) {
    return Response.json({ status: "out-of-scope", reply: scope.reply });
  }

  const ai = await requestFollowup(hint.diagnosis, hint.level, answer);
  if (!ai.hint) {
    return Response.json({ status: "none" });
  }

  // The child's own words are stored with the follow-up, so the teacher
  // approves the exchange rather than a sentence with no question in front of
  // it, and so anything worth acting on is visible to an adult.
  const { hint: saved, duplicate, autoApproved } = await createHint({
    studentId: who.studentId,
    lessonId: hint.lessonId,
    diagnosis: hint.diagnosis,
    level: ai.hint.level,
    text: ai.hint.text,
    childAnswer: answer,
    answeredHintId: hint.id,
  });

  return Response.json({
    // "sent" means it is already with the child because no teacher is online.
    status: autoApproved
      ? "sent"
      : duplicate && saved.status === "APPROVED"
        ? "already"
        : "pending",
    hintId: saved.id,
    duplicate,
    autoApproved,
  });
}
