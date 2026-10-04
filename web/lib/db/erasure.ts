import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

// Deleting a child, properly.
//
// The database half is handled by onDelete: Cascade on every relation that
// points at a Student, so one delete takes their enrolments, projects, hints,
// skill estimates, evidence, progress, consent records and sign-in account
// with it.
//
// The disk half is not, because a file is not a foreign key. The .sb3 files a
// child saved sit in storage/projects and nothing in the database would stop
// the row going while the file stayed. A right to erasure that leaves a
// child's work on a disk somewhere is not erasure, so the files go first: if
// something fails halfway, a missing file with a live row is recoverable and
// noticeable, while an orphaned file nobody can find is neither.

const DIR = path.join(process.cwd(), "storage", "projects");

export type Erased = {
  studentId: string;
  displayName: string;
  filesDeleted: number;
  filesMissing: number;
};

export async function eraseStudent(studentId: string): Promise<Erased | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, displayName: true, projects: { select: { sb3Ref: true } } },
  });
  if (!student) return null;

  let filesDeleted = 0;
  let filesMissing = 0;

  for (const project of student.projects) {
    // A ref is a bare filename written by lib/storage. Resolve it and confirm
    // it still lands inside the storage directory before unlinking, so a
    // malformed ref cannot be used to delete something elsewhere on the disk.
    const target = path.resolve(DIR, project.sb3Ref);
    if (!target.startsWith(path.resolve(DIR) + path.sep)) {
      filesMissing += 1;
      continue;
    }
    try {
      await unlink(target);
      filesDeleted += 1;
    } catch {
      // Already gone, which is the state we were aiming for anyway.
      filesMissing += 1;
    }
  }

  await prisma.student.delete({ where: { id: studentId } });

  return {
    studentId: student.id,
    displayName: student.displayName,
    filesDeleted,
    filesMissing,
  };
}

// What would go, without anything going. A parent or an administrator should
// be able to see the size of what they are about to do.
export async function erasurePreview(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      displayName: true,
      _count: {
        select: {
          projects: true,
          hintEvents: true,
          enrolments: true,
          studentProgress: true,
          skills: true,
          evidence: true,
          consents: true,
        },
      },
    },
  });
  if (!student) return null;
  return {
    studentId: student.id,
    displayName: student.displayName,
    counts: student._count,
  };
}
