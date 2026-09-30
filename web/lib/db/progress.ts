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
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: {
        select: { title: true, goal: true, orderNo: true, courseId: true },
      },
    },
  });
}

// Every child of one parent, so the recap can show a family at a glance
// without the page asking for each child in turn.
export function progressForParent(parentId: string) {
  return prisma.studentProgress.findMany({
    where: { student: { parentId } },
    orderBy: { updatedAt: "desc" },
    include: {
      student: { select: { id: true, displayName: true } },
      lesson: { select: { title: true, goal: true, orderNo: true } },
    },
  });
}

// Everyone's, for a teacher. Newest first, so the class a teacher just
// watched is at the top.
export function progressForAll(limit = 200) {
  return prisma.studentProgress.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      student: { select: { id: true, displayName: true } },
      lesson: { select: { title: true, goal: true, orderNo: true } },
    },
  });
}
