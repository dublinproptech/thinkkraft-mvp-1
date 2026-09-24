import { prisma } from "@/lib/prisma";
import type { HintEvent } from "@/generated/prisma/client";
import { isSupervised } from "@/lib/db/presence";

// Filing a hint, without ever filing the same one twice.
//
// The hint ladder is deterministic: the same gap at the same level produces the
// same rung every time. So a child who checks their work twice without changing
// anything would otherwise collect two identical cards, and the teacher would
// get two identical things to approve. A repeat is not new information.
//
// Two hints count as the same when they are the same rung for the same gap, or
// when the wording came out identical anyway (the model rephrases, so the same
// rung can arrive worded two ways, and two different rungs never should be).
// Only hints that are still live count: a rejected one is not a reason to stay
// silent. A genuinely stuck child still hears something new, because their
// attempt count moves them up a rung.
export async function createHint(data: {
  studentId: string;
  lessonId: string;
  diagnosis: string;
  level: number;
  text: string;
  childAnswer?: string;
  answeredHintId?: string;
}): Promise<{ hint: HintEvent; duplicate: boolean; autoApproved: boolean }> {
  // A reply is never a duplicate, whatever Milo says back. The child wrote
  // something, and dropping the row would drop their words with it.
  const existing = data.childAnswer
    ? null
    : await prisma.hintEvent.findFirst({
        where: {
          studentId: data.studentId,
          lessonId: data.lessonId,
          status: { in: ["PROPOSED", "APPROVED"] },
          OR: [
            { diagnosis: data.diagnosis, level: data.level },
            { text: data.text },
          ],
        },
      });
  if (existing) {
    return {
      hint: existing,
      duplicate: true,
      autoApproved: existing.autoApprovedAt !== null,
    };
  }

  // The approval gate, and the one condition under which it opens by itself.
  //
  // A hint normally waits for a teacher. When nobody is watching the queue,
  // waiting means a child sits with no help at all until someone signs in,
  // possibly the next day, so the hint goes straight out instead and the fact
  // that it did is stamped on the row. isSupervised() answers "supervised" on
  // any error, so a failure leaves the gate shut rather than open.
  const supervised = await isSupervised();

  const hint = await prisma.hintEvent.create({
    data: supervised
      ? { ...data, status: "PROPOSED" }
      : { ...data, status: "APPROVED", autoApprovedAt: new Date() },
  });
  return { hint, duplicate: false, autoApproved: !supervised };
}

// Hints a teacher still needs to review.
export function pendingHints() {
  return prisma.hintEvent.findMany({
    where: { status: "PROPOSED" },
    orderBy: { createdAt: "asc" },
    include: {
      student: { select: { displayName: true } },
      // A follow-up is approved with the exchange in view: the tip the child
      // answered, what they wrote, and what Milo proposes saying back.
      answeredHint: { select: { text: true, level: true } },
    },
  });
}

// Approve and reject are the two doors out of PROPOSED, and the only ways a
// hint's status ever changes. Both are written as a conditional update: the
// status must still be PROPOSED for the write to land. That way two teachers
// clicking at once cannot both succeed, and an already-rejected hint can never
// be quietly flipped to approved. A null return means the transition was not
// allowed, which the route turns into a 409.

async function decide(
  id: string,
  teacherId: string,
  status: "APPROVED" | "REJECTED",
) {
  const { count } = await prisma.hintEvent.updateMany({
    where: { id, status: "PROPOSED" },
    data: { status, approvedById: teacherId },
  });
  if (count === 0) return null;
  return prisma.hintEvent.findUnique({ where: { id } });
}

// Teacher approves: the hint becomes visible to the child.
export function approveHint(id: string, teacherId: string) {
  return decide(id, teacherId, "APPROVED");
}

// Teacher rejects: the hint is never delivered. approvedById records who
// reviewed it, not who endorsed it.
export function rejectHint(id: string, teacherId: string) {
  return decide(id, teacherId, "REJECTED");
}

// One hint, only if it belongs to this child. Used before acting on a hint id
// that arrived from the browser, so a child cannot reply to someone else's hint.
export function hintForStudent(id: string, studentId: string) {
  return prisma.hintEvent.findFirst({ where: { id, studentId } });
}

// The child closing a card. Scoped to their own hints, and a stamp rather than
// a delete: the teacher's record of what was approved is not theirs to remove.
export async function dismissHint(id: string, studentId: string) {
  const { count } = await prisma.hintEvent.updateMany({
    where: { id, studentId, dismissedAt: null },
    data: { dismissedAt: new Date() },
  });
  return count > 0;
}

// Approved hints for one student, newest first (what the child sees).
// Pass a lessonId to get only the hints for the lesson they are working on:
// a tip about loops is noise while they are building something about variables.
export function approvedHintsForStudent(studentId: string, lessonId?: string) {
  return prisma.hintEvent.findMany({
    where: {
      studentId,
      status: "APPROVED",
      dismissedAt: null,
      ...(lessonId ? { lessonId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}
