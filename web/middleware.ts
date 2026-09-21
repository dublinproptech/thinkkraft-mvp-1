import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Page-level protection, enforced on the server before a page renders.
//
// The pages also check the session client-side to render sensibly, but that
// check is cosmetic: it runs after the page has already been sent. This is the
// one that actually decides.

const AREAS = [
  { prefix: "/workspace", role: "STUDENT" },
  { prefix: "/dashboard", role: "STUDENT" },
  { prefix: "/teacher", role: "TEACHER" },
  { prefix: "/parent", role: "PARENT" },
  { prefix: "/enrol", role: "PARENT" },
] as const;

const HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  PARENT: "/parent",
};

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const { pathname } = req.nextUrl;

    const area = AREAS.find((a) => pathname.startsWith(a.prefix));
    if (!area || !role) return NextResponse.next();

    // Signed in, but this is someone else's area. Send them to their own
    // rather than to the login page, which would look like a failed login.
    if (role !== area.role) {
      return NextResponse.redirect(new URL(HOME[role] ?? "/", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // withAuth handles the redirect to /login when this is false.
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/workspace/:path*",
    "/dashboard/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/enrol/:path*",
  ],
};
