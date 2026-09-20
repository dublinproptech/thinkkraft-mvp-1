import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Server-side identity for API routes.
//
// The rule: a route never takes studentId, teacherId or parentId from the
// request. It asks here instead. The client can say anything; the session
// cannot. Middleware guards pages, these guard the data.
//
// Use:
//   const who = await requireStudent();
//   if (!who.ok) return who.response;
//   ... who.studentId is now trustworthy

type Role = "STUDENT" | "TEACHER" | "PARENT";

type Denied = { ok: false; response: Response };

type Identity = {
  ok: true;
  userId: string;
  role: Role;
  studentId: string | null;
  teacherId: string | null;
  parentId: string | null;
};

function deny(status: number, error: string): Denied {
  return { ok: false, response: Response.json({ error }, { status }) };
}

export async function requireSession(): Promise<Identity | Denied> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return deny(401, "Not signed in.");

  return {
    ok: true,
    userId: session.user.id,
    role: session.user.role as Role,
    studentId: session.user.studentId ?? null,
    teacherId: session.user.teacherId ?? null,
    parentId: session.user.parentId ?? null,
  };
}

async function requireRole(role: Role): Promise<Identity | Denied> {
  const who = await requireSession();
  if (!who.ok) return who;
  if (who.role !== role) return deny(403, `This action is for ${role.toLowerCase()}s.`);
  return who;
}

// Each of these narrows the profile id to a string, so callers do not have to
// null-check an id the role guarantees. authorize() already refuses to issue a
// session whose role has no matching profile row, so the null branch here is a
// belt-and-braces check rather than an expected path.

export async function requireStudent(): Promise<
  (Identity & { studentId: string }) | Denied
> {
  const who = await requireRole("STUDENT");
  if (!who.ok) return who;
  if (!who.studentId) return deny(403, "This account has no student profile.");
  return { ...who, studentId: who.studentId };
}

export async function requireTeacher(): Promise<
  (Identity & { teacherId: string }) | Denied
> {
  const who = await requireRole("TEACHER");
  if (!who.ok) return who;
  if (!who.teacherId) return deny(403, "This account has no teacher profile.");
  return { ...who, teacherId: who.teacherId };
}

export async function requireParent(): Promise<
  (Identity & { parentId: string }) | Denied
> {
  const who = await requireRole("PARENT");
  if (!who.ok) return who;
  if (!who.parentId) return deny(403, "This account has no parent profile.");
  return { ...who, parentId: who.parentId };
}
