import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// The single definition of how a person proves who they are.
// It lives here, not in the route file, so server code can import it without
// pulling in a route handler. The route file just hands it to NextAuth.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password or PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) return null;

        const identifier = credentials.usernameOrEmail.trim();

        // Adults sign in with an email, children with a username. One lookup
        // covers both. Email is stored lower-cased, so match it that way.
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
          },
          // The profile rows carry the human name. A child has no email to fall
          // back on, so without this the app bar would have nothing to show.
          include: {
            student: { select: { displayName: true } },
            teacher: { select: { name: true } },
            parent: { select: { name: true } },
          },
        });

        // Hash a throwaway value when no user matched so that a missing account
        // and a wrong password take about the same time to answer.
        if (!user) {
          await bcrypt.compare(credentials.password, DUMMY_HASH);
          return null;
        }

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        // A role is only real if the matching profile row is actually linked.
        // Without this a User row with role TEACHER but no teacherId would pass
        // the role check in an API route and then fail on the foreign key.
        //
        // ADMIN is the exception: it has no profile row by design, because an
        // admin is an operator of the system rather than someone in a
        // classroom. Nothing an admin does is keyed by who they are.
        if (user.role !== "ADMIN" && !profileIdFor(user)) return null;

        return {
          id: user.id,
          email: user.email,
          name:
            user.student?.displayName ??
            user.teacher?.name ??
            user.parent?.name ??
            user.username ??
            user.email,
          role: user.role,
          studentId: user.studentId,
          teacherId: user.teacherId,
          parentId: user.parentId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.studentId = user.studentId;
        token.teacherId = user.teacherId;
        token.parentId = user.parentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // token.sub is the User id. It is NOT the Student or Teacher id:
        // those are separate rows, and every foreign key in the app points at
        // them, not at User. Keep all four distinct.
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.studentId = token.studentId;
        session.user.teacherId = token.teacherId;
        session.user.parentId = token.parentId;
      }
      return session;
    },
  },
};

// A valid bcrypt hash of a value nobody can supply, used only to even out timing.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.Vx1z3nL0pMR2Wm1bYVmVZVeGkQZm";

function profileIdFor(user: {
  role: string;
  studentId: string | null;
  teacherId: string | null;
  parentId: string | null;
}) {
  if (user.role === "STUDENT") return user.studentId;
  if (user.role === "TEACHER") return user.teacherId;
  if (user.role === "PARENT") return user.parentId;
  return null;
}
