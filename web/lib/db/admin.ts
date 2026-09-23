import { prisma } from "@/lib/prisma";

// Everything the admin panel reads and writes.
//
// Deleting is the interesting part. A course has lessons, a lesson has
// children's projects and the hints a teacher approved, a teacher has the
// record of what they approved. None of that is an admin's to erase by
// pressing a button, and the database would refuse anyway. So each delete
// counts what points at the row first and refuses with the reason, which the
// route turns into a 409 the panel can show.

// Three outcomes, not two: gone already is not the same as still in use, and
// wrapping the first in the second's sentence produced "Still in use by That
// course no longer exists."
export type DeleteResult =
  | { ok: true }
  | { ok: false; reason: "missing" }
  | { ok: false; reason: "in-use"; blockers: string[] };

function plural(n: number, one: string) {
  return `${n} ${one}${n === 1 ? "" : "s"}`;
}

// ---------- courses ----------

export function listCourses() {
  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true, cohorts: true } } },
  });
}

export function getCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { orderNo: "asc" } },
      _count: { select: { lessons: true, cohorts: true } },
    },
  });
}

export function createCourse(data: { title: string; ageBand: string }) {
  return prisma.course.create({ data });
}

export function updateCourse(id: string, data: { title: string; ageBand: string }) {
  return prisma.course.update({ where: { id }, data });
}

export async function deleteCourse(id: string): Promise<DeleteResult> {
  const counts = await prisma.course.findUnique({
    where: { id },
    select: { _count: { select: { lessons: true, cohorts: true } } },
  });
  if (!counts) return { ok: false, reason: "missing" };

  const blockers: string[] = [];
  if (counts._count.lessons) blockers.push(plural(counts._count.lessons, "lesson"));
  if (counts._count.cohorts) blockers.push(plural(counts._count.cohorts, "class"));
  if (blockers.length) return { ok: false, reason: "in-use", blockers };

  await prisma.course.delete({ where: { id } });
  return { ok: true };
}

// ---------- lessons ----------

export function listLessons(courseId?: string) {
  return prisma.lesson.findMany({
    where: courseId ? { courseId } : {},
    orderBy: [{ courseId: "asc" }, { orderNo: "asc" }],
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { projects: true, hintEvents: true, studentProgress: true } },
    },
  });
}

export function getLesson(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: { course: { select: { id: true, title: true } } },
  });
}

type LessonInput = {
  id?: string;
  title: string | null;
  goal: string;
  orderNo: number;
  courseId: string;
};

// Lesson ids are readable strings in this codebase, not cuids: hints and
// projects are filed against "loops-1". So a new lesson may name its own id,
// and it is only settable at creation, because changing it later would orphan
// every project and hint already filed against the old one.
export function createLesson(data: LessonInput) {
  return prisma.lesson.create({
    data: {
      ...(data.id ? { id: data.id } : {}),
      title: data.title,
      goal: data.goal,
      orderNo: data.orderNo,
      courseId: data.courseId,
    },
  });
}

export function updateLesson(id: string, data: Omit<LessonInput, "id">) {
  return prisma.lesson.update({
    where: { id },
    data: {
      title: data.title,
      goal: data.goal,
      orderNo: data.orderNo,
      courseId: data.courseId,
    },
  });
}

export async function deleteLesson(id: string): Promise<DeleteResult> {
  const counts = await prisma.lesson.findUnique({
    where: { id },
    select: {
      _count: { select: { projects: true, hintEvents: true, studentProgress: true } },
    },
  });
  if (!counts) return { ok: false, reason: "missing" };

  const blockers: string[] = [];
  if (counts._count.projects) blockers.push(plural(counts._count.projects, "saved project"));
  if (counts._count.hintEvents) blockers.push(plural(counts._count.hintEvents, "hint"));
  if (counts._count.studentProgress) {
    blockers.push(plural(counts._count.studentProgress, "progress record"));
  }
  if (blockers.length) return { ok: false, reason: "in-use", blockers };

  await prisma.lesson.delete({ where: { id } });
  return { ok: true };
}

// ---------- teachers ----------

export function listTeachers() {
  return prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { cohorts: true, approvedHints: true } },
    },
  });
}

export function getTeacher(id: string) {
  return prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, createdAt: true } },
      cohorts: { include: { course: { select: { title: true } } } },
      _count: { select: { approvedHints: true } },
    },
  });
}

export function teacherByEmail(email: string) {
  return prisma.teacher.findUnique({ where: { email } });
}

// Creating a teacher makes two rows: the profile, and the account that signs in
// as it. They are written together, because a Teacher with no User cannot sign
// in and a User pointing at nothing is exactly what the session guards refuse.
export function createTeacher(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.create({
      data: { name: data.name, email: data.email },
    });
    await tx.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        role: "TEACHER",
        teacherId: teacher.id,
      },
    });
    return teacher;
  });
}

// The email lives on both rows, so it moves on both or neither.
export function updateTeacher(
  id: string,
  data: { name: string; email: string; passwordHash?: string },
) {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.update({
      where: { id },
      data: { name: data.name, email: data.email },
    });
    await tx.user.updateMany({
      where: { teacherId: id },
      data: {
        email: data.email,
        ...(data.passwordHash ? { password: data.passwordHash } : {}),
      },
    });
    return teacher;
  });
}

export async function deleteTeacher(id: string): Promise<DeleteResult> {
  const counts = await prisma.teacher.findUnique({
    where: { id },
    select: { _count: { select: { cohorts: true, approvedHints: true } } },
  });
  if (!counts) return { ok: false, reason: "missing" };

  const blockers: string[] = [];
  if (counts._count.cohorts) blockers.push(plural(counts._count.cohorts, "class"));
  if (counts._count.approvedHints) {
    blockers.push(plural(counts._count.approvedHints, "reviewed hint"));
  }
  if (blockers.length) return { ok: false, reason: "in-use", blockers };

  // The sign-in account goes with the profile. Leaving it would leave a User
  // with role TEACHER and nothing to be a teacher of.
  await prisma.$transaction([
    prisma.user.deleteMany({ where: { teacherId: id } }),
    prisma.teacher.delete({ where: { id } }),
  ]);
  return { ok: true };
}

// ---------- people, read only ----------

export function listStudents() {
  return prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      parent: { select: { id: true, name: true, email: true } },
      user: { select: { username: true } },
      _count: { select: { enrolments: true, projects: true, hintEvents: true } },
    },
  });
}

export function listParents() {
  return prisma.parent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      students: { select: { id: true, displayName: true } },
      _count: { select: { students: true, consents: true } },
    },
  });
}

// ---------- the dashboard ----------

export async function adminStats() {
  const [courses, lessons, teachers, students, parents, pendingHints] =
    await Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.parent.count(),
      prisma.hintEvent.count({ where: { status: "PROPOSED" } }),
    ]);
  return { courses, lessons, teachers, students, parents, pendingHints };
}
