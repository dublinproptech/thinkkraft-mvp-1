import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Development sign-ins. Every profile row needs a matching User row or nobody
// can log in, which is what the /api/setup backdoor used to paper over.
// These are local development credentials only.
const DEV_PASSWORD = "thinkkraft123";
const DEV_PIN = "1234";

async function main() {
  // 1. A teacher lead the cohort
  const teacher = await prisma.teacher.upsert({
    where: { email: "teacher@thinkkraft.ai" },
    update: {},
    create: { name: "Ms Riordain", email: "teacher@thinkkraft.ai" },
  });

  // 2. Beginner Course
  const beginnerCourse = await prisma.course.upsert({
    where: { id: "scratch-beginner" },
    update: {},
    create: {
      id: "scratch-beginner",
      title: "Scratch Coding Program – Beginner Level",
      ageBand: "8-13",
    },
  });

  const beginnerLessons = [
    { id: "beg-w1", orderNo: 1, goal: "Week 1 — Introduction to Scratch & Basic Motion" },
    { id: "beg-w2", orderNo: 2, goal: "Week 2 — Events, Sounds & Storytelling" },
    { id: "beg-w3", orderNo: 3, goal: "Week 3 — Loops & Repetition" },
    { id: "beg-w4", orderNo: 4, goal: "Week 4 — Variables & Scoring Systems" },
    { id: "beg-w5", orderNo: 5, goal: "Week 5 — Conditions & Decision Making" },
    { id: "beg-w6", orderNo: 6, goal: "Week 6 — Game Design Fundamentals" },
    { id: "beg-w7", orderNo: 7, goal: "Week 7 — Final Project Development" },
    { id: "beg-w8", orderNo: 8, goal: "Week 8 — Showcase & Presentation" },
  ];

  for (const l of beginnerLessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { goal: l.goal, orderNo: l.orderNo, courseId: beginnerCourse.id },
      create: {
        id: l.id,
        courseId: beginnerCourse.id,
        orderNo: l.orderNo,
        goal: l.goal,
      },
    });
  }

  // 3. Intermediate Course
  const intermediateCourse = await prisma.course.upsert({
    where: { id: "scratch-intermediate" },
    update: {},
    create: {
      id: "scratch-intermediate",
      title: "Scratch Coding Program - Intermediate Level",
      ageBand: "9-13",
    },
  });

  const intermediateLessons = [
    { id: "int-w1", orderNo: 1, goal: "Intermediate Week 1 - Custom Blocks (My Blocks)" },
    { id: "int-w2", orderNo: 2, goal: "Intermediate Week 2 - Lists: Storing Many Pieces of Information" },
    { id: "int-w3", orderNo: 3, goal: "Intermediate Week 3 - Operators, Randomness and Smarter Logic" },
    { id: "int-w4", orderNo: 4, goal: "Intermediate Week 4 - Advanced Clones and Simple Physics" },
    { id: "int-w5", orderNo: 5, goal: "Intermediate Week 5 - Game States: Menus, Levels and Game Over Screens" },
    { id: "int-w6", orderNo: 6, goal: "Intermediate Week 6 - Final Intermediate Project and Showcase" },
  ];

  for (const l of intermediateLessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { goal: l.goal, orderNo: l.orderNo, courseId: intermediateCourse.id },
      create: {
        id: l.id,
        courseId: intermediateCourse.id,
        orderNo: l.orderNo,
        goal: l.goal,
      },
    });
  }

  // 4. A cohort: a specific running of the course, led by the teacher
  await prisma.cohort.upsert({
    where: { id: "cohort-autumn" },
    update: {},
    create: {
      id: "cohort-autumn",
      schedule: "Saturdays 10:00",
      courseId: beginnerCourse.id,
      teacherId: teacher.id,
    },
  });

  // 5. Sign-in accounts. Each User row links to the profile row it acts as,
  // so a session can carry both the user id and the teacher/parent/student id.
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const pinHash = await bcrypt.hash(DEV_PIN, 10);

  await prisma.user.upsert({
    where: { email: teacher.email },
    update: { password: passwordHash, role: "TEACHER", teacherId: teacher.id },
    create: {
      email: teacher.email,
      password: passwordHash,
      role: "TEACHER",
      teacherId: teacher.id,
    },
  });

  const parent = await prisma.parent.upsert({
    where: { email: "parent@thinkkraft.ai" },
    update: {},
    create: { name: "Dana Whelan", email: "parent@thinkkraft.ai" },
  });

  await prisma.user.upsert({
    where: { email: parent.email },
    update: { password: passwordHash, role: "PARENT", parentId: parent.id },
    create: {
      email: parent.email,
      password: passwordHash,
      role: "PARENT",
      parentId: parent.id,
    },
  });

  // A child, created the way the app creates one: under a parent, with a
  // username and PIN rather than an email, and with consent recorded.
  const existingChild = await prisma.student.findFirst({
    where: { parentId: parent.id, displayName: "Alice" },
  });
  const child =
    existingChild ??
    (await prisma.student.create({
      data: { displayName: "Alice", ageBand: "9-13", parentId: parent.id },
    }));

  await prisma.user.upsert({
    where: { username: "alice123" },
    update: { password: pinHash, role: "STUDENT", studentId: child.id },
    create: {
      username: "alice123",
      password: pinHash,
      role: "STUDENT",
      studentId: child.id,
    },
  });

  const consent = await prisma.consent.findFirst({
    where: { parentId: parent.id, studentId: child.id },
  });
  if (!consent) {
    await prisma.consent.create({
      data: { parentId: parent.id, studentId: child.id },
    });
  }

  await prisma.enrolment.upsert({
    where: {
      studentId_cohortId: { studentId: child.id, cohortId: "cohort-autumn" },
    },
    update: {},
    create: { studentId: child.id, cohortId: "cohort-autumn" },
  });

  console.log("Seed complete: 2 courses, 14 lessons, 1 cohort, 3 sign-ins");
  console.log(`  teacher  ${teacher.email} / ${DEV_PASSWORD}`);
  console.log(`  parent   ${parent.email} / ${DEV_PASSWORD}`);
  console.log(`  child    alice123 / ${DEV_PIN}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });