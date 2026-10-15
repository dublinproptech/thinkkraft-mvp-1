/**
 * The role x route authorization matrix, driven.
 *
 * Broken access control is the most common real finding in a role-based app,
 * and this one has four roles, children's data, and routes whose names are
 * close enough to each other that a guard copied from the wrong neighbour
 * would not look wrong. So every row of authorizationMatrix.ts is checked
 * against every caller, including no caller at all: 4 roles plus anonymous,
 * across every route and method.
 *
 * What is asserted, precisely:
 *
 *   refused   the handler answered 401 (not signed in) or 403 (signed in,
 *             not allowed) without reaching its body
 *   reached   the handler got past its guard
 *
 * "Reached" is deliberately weaker than "succeeded". The database and the AI
 * service are not running here, so an allowed call may well fail further in,
 * and a test that demanded a 200 would be testing the fixtures. What matters
 * for access control is the guard's verdict, and a handler that throws while
 * talking to a mocked database has already given it. Whether the body then
 * does the right thing is what the service tests and the end-to-end journey
 * are for.
 *
 * The status codes are part of the assertion rather than a detail. 401 and 403
 * mean different things to the browser: the first sends someone to sign in,
 * the second tells them they are signed in as the wrong person. A route that
 * answers 403 to an anonymous caller leaves them with no way forward.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CALLERS,
  NOT_IN_MATRIX,
  ROLES,
  ROUTES,
  type Caller,
  type RouteCase,
  type Role,
  allowedFor,
  describeCase,
} from "./authorizationMatrix";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

// ---------- the seams ----------

// NextAuth is the only thing that decides who the caller is. Replacing it here
// is what lets the matrix be driven: everything downstream, including
// lib/session.ts and every guard built on it, runs exactly as it does in
// production.
const getServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...(args as [])),
  default: {},
}));

// A database that answers every call without one being there. The guards run
// before any query on the routes being driven, so what this returns does not
// decide any verdict; it exists so that importing a route, and letting an
// allowed call fall into its body, does not need Postgres.
function dbStub(): unknown {
  return new Proxy(function () {} as unknown as object, {
    get: (_target, prop) => {
      if (prop === "then") return undefined; // not a thenable; await works on calls, not on this
      return dbStub();
    },
    apply: () => Promise.resolve(null),
  });
}

vi.mock("@/lib/prisma", () => ({ prisma: dbStub() }));

// Nothing is written to disk and nothing is sent anywhere.
vi.mock("@/lib/storage", () => ({
  saveSb3: vi.fn(async () => "test-ref.sb3"),
  readSb3: vi.fn(async () => Buffer.alloc(0)),
}));

// Ownership is a database question, and it is the one the tests below need to
// control: whether a given child belongs to a given parent is the whole
// subject of the parent cases. Only this one function is replaced, so the rest
// of the module behaves normally.
const studentBelongsToParent = vi.fn<(studentId: string, parentId: string) => Promise<boolean>>(
  () => Promise.resolve(true),
);
vi.mock("@/lib/db/people", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    studentBelongsToParent: (studentId: string, parentId: string) =>
      studentBelongsToParent(studentId, parentId),
  };
});

vi.stubGlobal(
  "fetch",
  vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
);

// ---------- route modules ----------

// Written out one by one rather than imported from a variable. A dynamic
// specifier would mean a renamed or deleted route silently dropping out of the
// run, which on a test of access control is the worst available failure mode:
// the suite would go green by testing nothing.
const MODULES: Record<string, () => Promise<Record<string, unknown>>> = {
  "@/app/api/health/route": () => import("@/app/api/health/route"),
  "@/app/api/ai-check/route": () => import("@/app/api/ai-check/route"),
  "@/app/api/courses/route": () => import("@/app/api/courses/route"),
  "@/app/api/courses/[id]/route": () => import("@/app/api/courses/[id]/route"),
  "@/app/api/auth/register/route": () => import("@/app/api/auth/register/route"),
  "@/app/api/activity/route": () => import("@/app/api/activity/route"),
  "@/app/api/progress/route": () => import("@/app/api/progress/route"),
  "@/app/api/projects/route": () => import("@/app/api/projects/route"),
  "@/app/api/my/lessons/route": () => import("@/app/api/my/lessons/route"),
  "@/app/api/ai/generate/route": () => import("@/app/api/ai/generate/route"),
  "@/app/api/learner/practice/route": () => import("@/app/api/learner/practice/route"),
  "@/app/api/hints/request/route": () => import("@/app/api/hints/request/route"),
  "@/app/api/hints/reply/route": () => import("@/app/api/hints/reply/route"),
  "@/app/api/hints/dismiss/route": () => import("@/app/api/hints/dismiss/route"),
  "@/app/api/hints/proactive/route": () => import("@/app/api/hints/proactive/route"),
  "@/app/api/hints/stream/route": () => import("@/app/api/hints/stream/route"),
  "@/app/api/hints/pending/route": () => import("@/app/api/hints/pending/route"),
  "@/app/api/hints/approve/route": () => import("@/app/api/hints/approve/route"),
  "@/app/api/hints/reject/route": () => import("@/app/api/hints/reject/route"),
  "@/app/api/hints/auto-approved/route": () => import("@/app/api/hints/auto-approved/route"),
  "@/app/api/learner/overview/route": () => import("@/app/api/learner/overview/route"),
  "@/app/api/progress/all/route": () => import("@/app/api/progress/all/route"),
  "@/app/api/parents/children/route": () => import("@/app/api/parents/children/route"),
  "@/app/api/progress/parent/route": () => import("@/app/api/progress/parent/route"),
  "@/app/api/admin/stats/route": () => import("@/app/api/admin/stats/route"),
  "@/app/api/admin/students/route": () => import("@/app/api/admin/students/route"),
  "@/app/api/admin/parents/route": () => import("@/app/api/admin/parents/route"),
  "@/app/api/admin/teachers/route": () => import("@/app/api/admin/teachers/route"),
  "@/app/api/admin/teachers/[id]/route": () => import("@/app/api/admin/teachers/[id]/route"),
  "@/app/api/admin/courses/route": () => import("@/app/api/admin/courses/route"),
  "@/app/api/admin/courses/[id]/route": () => import("@/app/api/admin/courses/[id]/route"),
  "@/app/api/admin/lessons/route": () => import("@/app/api/admin/lessons/route"),
  "@/app/api/admin/lessons/[id]/route": () => import("@/app/api/admin/lessons/[id]/route"),
  "@/app/api/learner/[studentId]/route": () => import("@/app/api/learner/[studentId]/route"),
  "@/app/api/hints/for-student/route": () => import("@/app/api/hints/for-student/route"),
  "@/app/api/learner/next/route": () => import("@/app/api/learner/next/route"),
  "@/app/api/cohorts/route": () => import("@/app/api/cohorts/route"),
  "@/app/api/enrolments/route": () => import("@/app/api/enrolments/route"),
};

// ---------- callers ----------

// The ids line up with the matrix's fixtures: the student is student-1, so a
// student reading /api/learner/student-1 is reading their own profile. Where a
// test is about reaching for someone else's, it says so by using a different
// id, not by changing the session.
const SESSIONS: Record<Role, unknown> = {
  STUDENT: { user: { id: "user-student", role: "STUDENT", studentId: "student-1" } },
  TEACHER: { user: { id: "user-teacher", role: "TEACHER", teacherId: "teacher-1" } },
  PARENT: { user: { id: "user-parent", role: "PARENT", parentId: "parent-1" } },
  ADMIN: { user: { id: "user-admin", role: "ADMIN" } },
};

function signIn(caller: Caller) {
  getServerSession.mockResolvedValue(caller === "ANON" ? null : SESSIONS[caller]);
}

// ---------- calling a route ----------

const BASE = "http://localhost:3000";

function buildRequest(route: RouteCase): Request {
  const url = `${BASE}/${route.path.replace(/\[(\w+)\]/g, (_m, key) => route.params?.[key] ?? key)}`;

  if (route.method === "GET" || route.method === "DELETE") {
    return new Request(url, { method: route.method });
  }
  return new Request(url, {
    method: route.method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(route.body ?? {}),
  });
}

type Verdict = { status: number | null; threw: boolean };

async function call(route: RouteCase, overrides: Partial<RouteCase> = {}): Promise<Verdict> {
  const effective = { ...route, ...overrides };
  const load = MODULES[effective.module];
  if (!load) throw new Error(`No loader registered for ${effective.module}`);

  const mod = await load();
  const handler = mod[effective.method];
  if (typeof handler !== "function") {
    throw new Error(`${effective.module} exports no ${effective.method} handler`);
  }

  // Next 15 and later hand params in as a promise, which is how the dynamic
  // routes in this app read them.
  const ctx = { params: Promise.resolve(effective.params ?? {}) };

  try {
    const res = (await (handler as (r: Request, c: unknown) => Promise<Response>)(
      buildRequest(effective),
      ctx,
    )) as Response;
    return { status: res.status, threw: false };
  } catch {
    // Past the guard and broken further in, on a machine with no database.
    // That is a pass for this test and a question for another one.
    return { status: null, threw: true };
  }
}

const REFUSALS = [401, 403];

function expectRefused(verdict: Verdict, expected: number, label: string) {
  expect(verdict.threw, `${label}: handler threw instead of refusing`).toBe(false);
  expect(verdict.status, label).toBe(expected);
}

function expectReached(verdict: Verdict, label: string) {
  if (verdict.threw) return; // reached the body, failed on a missing dependency
  expect(REFUSALS, `${label}: refused a caller who should be allowed`).not.toContain(
    verdict.status,
  );
}

// ---------- the matrix ----------

beforeEach(() => {
  vi.clearAllMocks();
  studentBelongsToParent.mockResolvedValue(true);
});

describe("every route against every caller", () => {
  for (const route of ROUTES) {
    const allowed = allowedFor(route);
    const open = route.allow === "PUBLIC";

    describe(describeCase(route), () => {
      for (const caller of CALLERS) {
        const mayPass = caller === "ANON" ? open : allowed.includes(caller as Role);
        const label = `${caller} ${mayPass ? "is allowed" : "is refused"}`;

        it(label, async () => {
          signIn(caller);
          const verdict = await call(route);
          const context = `${describeCase(route)} as ${caller} — ${route.note}`;

          if (mayPass) {
            expectReached(verdict, context);
          } else {
            // Anonymous gets 401: nothing is forbidden, they have not said who
            // they are. A signed-in caller of the wrong role gets 403.
            expectRefused(verdict, caller === "ANON" ? 401 : 403, context);
          }
        });
      }
    });
  }
});

// ---------- ownership, which the matrix cannot express ----------
//
// Four of these routes take an id from the request. Role alone does not settle
// them: a parent is allowed to read a child's hints, but not every child's.
// This is the hole the matrix would miss, and it is the same shape as the one
// the codebase closed earlier on /api/learner/[studentId].

describe("a student may only ever be the subject of their own data", () => {
  it("cannot read another child's skill profile", async () => {
    signIn("STUDENT");
    const verdict = await call(
      ROUTES.find((r) => r.path === "api/learner/[studentId]")!,
      { params: { studentId: "some-other-child" } },
    );
    expect(verdict.status).toBe(403);
  });

  it("can read their own", async () => {
    signIn("STUDENT");
    const verdict = await call(ROUTES.find((r) => r.path === "api/learner/[studentId]")!, {
      params: { studentId: "student-1" },
    });
    expectReached(verdict, "own profile");
  });

  it("cannot ask what another child should do next", async () => {
    signIn("STUDENT");
    const verdict = await call(ROUTES.find((r) => r.path === "api/learner/next")!, {
      body: { studentId: "some-other-child" },
    });
    expect(verdict.status).toBe(403);
  });

  it("cannot enrol themselves", async () => {
    signIn("STUDENT");
    const verdict = await call(ROUTES.find((r) => r.path === "api/enrolments")!);
    expect(verdict.status).toBe(403);
  });

  it("is given their own hints without being asked which child", async () => {
    // A student never names the id. The query parameter is only consulted for
    // the two adult roles, so passing someone else's must change nothing.
    signIn("STUDENT");
    const route = ROUTES.find((r) => r.path === "api/hints/for-student")!;
    const verdict = await call(route, { path: "api/hints/for-student?studentId=some-other-child" });
    expectReached(verdict, "student reading hints");
    expect(verdict.status).not.toBe(403);
  });
});

describe("a parent is held to their own family", () => {
  const forStudent = () => ROUTES.find((r) => r.path === "api/hints/for-student")!;

  it("cannot read hints for a child who is not theirs", async () => {
    studentBelongsToParent.mockResolvedValue(false);
    signIn("PARENT");
    const verdict = await call(forStudent(), {
      path: "api/hints/for-student?studentId=not-my-child",
    });
    expect(verdict.status).toBe(403);
  });

  it("can read hints for their own child", async () => {
    studentBelongsToParent.mockResolvedValue(true);
    signIn("PARENT");
    const verdict = await call(forStudent(), {
      path: "api/hints/for-student?studentId=student-1",
    });
    expectReached(verdict, "parent reading own child's hints");
  });

  it("is asked which child rather than being given a default", async () => {
    // Falling back to "all children" for an adult who named none would be a
    // cross-family read by omission.
    signIn("PARENT");
    const verdict = await call(forStudent());
    expect(verdict.status).toBe(400);
  });

  it("cannot enrol a child who is not theirs", async () => {
    studentBelongsToParent.mockResolvedValue(false);
    signIn("PARENT");
    const verdict = await call(ROUTES.find((r) => r.path === "api/enrolments")!);
    expect(verdict.status).toBe(403);
  });
});

describe("a teacher works across families by design", () => {
  it("may read any child's hints", async () => {
    // Not an oversight: a teacher's class crosses families, and the ownership
    // check is deliberately not applied to them. Written down so that if it
    // ever needs narrowing to their own cohort, this test is where it is said.
    signIn("TEACHER");
    const verdict = await call(ROUTES.find((r) => r.path === "api/hints/for-student")!, {
      path: "api/hints/for-student?studentId=any-child",
    });
    expectReached(verdict, "teacher reading a child's hints");
  });

  it("may read any child's skill profile", async () => {
    signIn("TEACHER");
    const verdict = await call(ROUTES.find((r) => r.path === "api/learner/[studentId]")!, {
      params: { studentId: "any-child" },
    });
    expectReached(verdict, "teacher reading a profile");
  });
});

// ---------- coverage ----------

describe("the matrix covers the app", () => {
  function routeFiles(dir: string, prefix = ""): string[] {
    const found: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        found.push(...routeFiles(full, `${prefix}${entry}/`));
      } else if (entry === "route.ts") {
        found.push(`app/api/${prefix}route.ts`);
      }
    }
    return found;
  }

  it("lists every API route that exists", () => {
    const onDisk = routeFiles(path.resolve(__dirname, "../app/api")).sort();
    const listed = new Set(
      ROUTES.map((r) => `app/${r.path}/route.ts`).concat(Object.keys(NOT_IN_MATRIX)),
    );

    const missing = onDisk.filter((f) => !listed.has(f));
    expect(
      missing,
      "A route exists with no entry in authorizationMatrix.ts. Decide who it is " +
        "for and add it, or record why it is exempt in NOT_IN_MATRIX.",
    ).toEqual([]);
  });

  it("lists no route that has stopped existing", () => {
    const onDisk = new Set(routeFiles(path.resolve(__dirname, "../app/api")));
    const stale = [...new Set(ROUTES.map((r) => `app/${r.path}/route.ts`))].filter(
      (f) => !onDisk.has(f),
    );
    expect(stale, "The matrix names a route that is no longer there.").toEqual([]);
  });

  it("drives every method each listed route exports", async () => {
    // A route file exporting POST while the matrix only lists its GET is a
    // whole verb nobody is checking, which is how an unguarded write survives
    // a review of the guarded read next to it.
    const untested: string[] = [];

    for (const specifier of new Set(ROUTES.map((r) => r.module))) {
      const mod = await MODULES[specifier]!();
      const listed = new Set(
        ROUTES.filter((r) => r.module === specifier).map((r) => r.method),
      );
      for (const verb of ["GET", "POST", "PUT", "DELETE"]) {
        if (typeof mod[verb] === "function" && !listed.has(verb as RouteCase["method"])) {
          untested.push(`${verb} ${specifier}`);
        }
      }
    }

    expect(untested).toEqual([]);
  });

  it("covers all four roles plus anonymous", () => {
    expect(ROLES).toHaveLength(4);
    expect(CALLERS).toHaveLength(5);
  });
});
