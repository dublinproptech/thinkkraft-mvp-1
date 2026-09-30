import { z } from "zod";
import { requestHint } from "@/lib/aiHint";
import { createHint } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";
import { projectBelongsToStudent } from "@/lib/db/projects";
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