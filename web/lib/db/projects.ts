import { prisma } from "@/lib/prisma";

export function createProject(data: {
  studentId: string;
  lessonId: string;
  sb3Ref: string;
}) {
  return prisma.project.create({ data });
}

// A stored .sb3 is only readable by the child who saved it. Checked before the
// file is handed to the AI service, so a guessed or copied sb3Ref gets nowhere.
export async function projectBelongsToStudent(sb3Ref: string, studentId: string) {
  const found = await prisma.project.findFirst({
    where: { sb3Ref, studentId },
    select: { id: true },
  });
  return found !== null;
}
