import { prisma } from "@/lib/prisma";

export function createProject(data: {
  studentId: string;
  lessonId: string;
  sb3Ref: string;
}) {
  return prisma.project.create({ data });
}
