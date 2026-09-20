import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export function createParent(data: { name: string; email: string }) {
  return prisma.parent.create({ data });
}

// A parent account is a Parent row plus the User row that signs in as it.
// Both or neither: a Parent with no User could never log in, and a User with
// no Parent would pass a role check and then fail on the foreign key.
// Returns null when the email is already taken.
export async function registerParent(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const parent = await tx.parent.create({
        data: { name: data.name, email: data.email },
      });
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.passwordHash,
          role: "PARENT",
          parentId: parent.id,
        },
      });
      return { parentId: parent.id, userId: user.id };
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return null;
    }
    throw e;
  }
}

// A child account, created by the signed-in parent. The Consent row is written
// in the same transaction: under this model the parent creating the account is
// the consent, so there is no window where a child exists without one.
// Returns null when the username is already taken.
export async function registerChild(data: {
  parentId: string;
  displayName: string;
  ageBand: string;
  username: string;
  pinHash: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          displayName: data.displayName,
          ageBand: data.ageBand,
          parentId: data.parentId,
        },
      });
      await tx.user.create({
        data: {
          username: data.username,
          password: data.pinHash,
          role: "STUDENT",
          studentId: student.id,
        },
      });
      await tx.consent.create({
        data: { parentId: data.parentId, studentId: student.id },
      });
      return { studentId: student.id, username: data.username };
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return null;
    }
    throw e;
  }
}

// Does this child belong to this parent? Used before any action a parent
// takes on a child, so that supplying someone else's studentId achieves nothing.
export async function studentBelongsToParent(studentId: string, parentId: string) {
  const found = await prisma.student.findFirst({
    where: { id: studentId, parentId },
    select: { id: true },
  });
  return found !== null;
}

// Everything the parent dashboard shows for each child: how they sign in, which
// class they are in, and enough of a progress summary to be worth reading.
export function childrenOfParent(parentId: string) {
  return prisma.student.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      displayName: true,
      ageBand: true,
      createdAt: true,
      user: { select: { username: true } },
      enrolments: {
        select: {
          status: true,
          cohort: {
            select: { id: true, schedule: true, course: { select: { title: true } } },
          },
        },
      },
      _count: {
        select: {
          projects: true,
          hintEvents: { where: { status: { in: ["APPROVED", "DELIVERED"] } } },
        },
      },
    },
  });
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
