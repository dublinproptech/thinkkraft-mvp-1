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

// Teacher approves: the hint becomes visible to the child.
export function approveHint(id: string, teacherId: string) {
  return prisma.hintEvent.update({
    where: { id },
    data: { status: "APPROVED", approvedById: teacherId },
  });
}

// Approved hints for one student, newest first (what the child sees).
export function approvedHintsForStudent(studentId: string) {
  return prisma.hintEvent.findMany({
    where: { studentId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}
