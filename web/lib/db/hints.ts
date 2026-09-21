import { prisma } from "@/lib/prisma";

export function createHint(data: {
  studentId: string;
  lessonId: string;
  diagnosis: string;
  level: number;
  text: string;
}) {
  return prisma.hintEvent.create({ data: { ...data, status: "PROPOSED" } });
}

// Hints a teacher still needs to review.
export function pendingHints() {
  return prisma.hintEvent.findMany({
    where: { status: "PROPOSED" },
    orderBy: { createdAt: "asc" },
    include: { student: { select: { displayName: true } } },
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

// Approved hints for one student, newest first (what the child sees).
export function approvedHintsForStudent(studentId: string) {
  return prisma.hintEvent.findMany({
    where: { studentId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}
