import { prisma } from "@/lib/prisma";

export function upsertProgress(data: {
  studentId: string;
  lessonId: string;
  completed: boolean;
  blocksUsed: number;
}) {
  const { studentId, lessonId, completed, blocksUsed } = data;
  return prisma.studentProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: { completed, blocksUsed },
    create: { studentId, lessonId, completed, blocksUsed },
  });
}

export function progressForStudent(studentId: string) {
  return prisma.studentProgress.findMany({
    where: { studentId },
    select: { lessonId: true, completed: true, blocksUsed: true, updatedAt: true },
  });
}
