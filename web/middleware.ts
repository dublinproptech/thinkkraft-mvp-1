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
  { prefix: "/admin", role: "ADMIN" },
] as const;

const HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  PARENT: "/parent",
  ADMIN: "/admin",
};

// Where someone is sent to sign in, by the area they were trying to reach.
// Staff sign in on their own pages, so a teacher landing on the children's
// login is not left wondering why it asks for a username and a PIN.
const LOGIN: Record<string, string> = {
  STUDENT: "/login",
  PARENT: "/login",
  TEACHER: "/teacher/login",
  ADMIN: "/admin/login",
};

// The sign-in pages sit inside guarded areas, so they have to be let through
// or nobody could ever reach them.
const PUBLIC = ["/admin/login", "/teacher/login"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
    const { pathname } = req.nextUrl;

    if (PUBLIC.includes(pathname)) {
      // Already signed in, so a login form is not what they need.
      if (role) return NextResponse.redirect(new URL(HOME[role] ?? "/", req.url));
      return NextResponse.next();
    }

    const area = AREAS.find((a) => pathname.startsWith(a.prefix));
    if (!area) return NextResponse.next();

    // Not signed in: send them to the right door, remembering where they were
    // headed so they land there rather than on a generic home page.
    if (!token) {
      const to = new URL(LOGIN[area.role] ?? "/login", req.url);
      to.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(to);
    }

    // Signed in, but this is someone else's area. Send them to their own
    // rather than to the login page, which would look like a failed login.
    if (role !== area.role) {
      return NextResponse.redirect(new URL((role && HOME[role]) || "/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run the function above: it decides, so that an unauthenticated
      // visitor can be routed to the sign-in page that matches the area.
      authorized: () => true,
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
    "/admin/:path*",
  ],
};
