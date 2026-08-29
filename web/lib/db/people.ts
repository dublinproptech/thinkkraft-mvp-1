import { prisma } from "@/lib/prisma";

export function createParent(data: { name: string; email: string }) {
  return prisma.parent.create({ data });
}

export function createStudent(data: {
  displayName: string;
  ageBand: string;
  parentId: string;
}) {
  return prisma.student.create({ data });
}

export function enrolStudent(data: { studentId: string; cohortId: string }) {
  return prisma.enrolment.create({ data });
}

export function getStudentWithEnrolments(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      enrolments: { include: { cohort: { include: { course: true } } } },
    },
  });
}
