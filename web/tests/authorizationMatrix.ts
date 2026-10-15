// Who may call what.
//
// This file is the specification, written once, in one place, so that the
// question "may a parent read another family's child?" has a single written
// answer rather than being inferred from whichever guard happens to be at the
// top of a route file. authorization.test.ts drives every row of it.
//
// It is deliberately a hand-written list and not something derived from the
// filesystem. A matrix generated from the routes would agree with the code by
// construction, including where the code is wrong, which is the one thing a
// test of access control must not do. Keeping it by hand means a new route is
// only covered once a person has decided who it is for, and the "every route
// is listed" test fails until they have.

export const ROLES = ["STUDENT", "TEACHER", "PARENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

// The caller, as the session layer sees them. ANON stands for no session at
// all, which must be refused with 401 rather than 403: nothing has been
// forbidden yet, they simply have not said who they are.
export type Caller = Role | "ANON";

export const CALLERS: Caller[] = [...ROLES, "ANON"];

export type RouteCase = {
  // Where it lives, relative to app/, for the message a failure prints.
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  // The module specifier the test imports. Written out rather than built from
  // path so the import is statically visible and a renamed route fails loudly
  // at import time instead of silently dropping out of the run.
  module: string;
  // Who is allowed through the guard. An empty list means nobody: signing in
  // is not enough and no role qualifies. "ANY" means any signed-in role.
  allow: Role[] | "ANY" | "PUBLIC";
  // Dynamic segments, if the handler takes params.
  params?: Record<string, string>;
  // A body for the methods that read one. The guard runs before validation on
  // every route here, so these only have to be syntactically present; where a
  // route checks ownership after validating, the body names the thing being
  // reached for.
  body?: unknown;
  // Why it is open to who it is open to. Read this, not the code, when
  // deciding whether a failure is a bug in the route or a bug in this list.
  note: string;
};

export const ROUTES: RouteCase[] = [
  // ---------- open to anyone, signed in or not ----------
  {
    path: "api/health",
    method: "GET",
    module: "@/app/api/health/route",
    allow: "PUBLIC",
    note: "Liveness probe. Read by the container healthcheck, which has no session.",
  },
  {
    path: "api/ai-check",
    method: "GET",
    module: "@/app/api/ai-check/route",
    allow: "PUBLIC",
    note: "Reports whether the AI service answers. A diagnostic, no child data in it.",
  },
  {
    path: "api/courses",
    method: "GET",
    module: "@/app/api/courses/route",
    allow: "PUBLIC",
    note: "The catalogue. A parent deciding whether to sign up has no account yet.",
  },
  {
    path: "api/courses/[id]",
    method: "GET",
    module: "@/app/api/courses/[id]/route",
    allow: "PUBLIC",
    params: { id: "course-1" },
    note: "One course from the public catalogue.",
  },
  {
    path: "api/auth/register",
    method: "POST",
    module: "@/app/api/auth/register/route",
    allow: "PUBLIC",
    body: { name: "A Parent", email: "parent@example.com", password: "a-long-password" },
    note: "Creating the first account cannot require an account.",
  },

  // ---------- children only ----------
  // These are the routes a child's own session drives. Every one of them takes
  // the child's identity from the session and never from the request, so a
  // student is the only role that can be the subject of them.
  {
    path: "api/activity",
    method: "POST",
    module: "@/app/api/activity/route",
    allow: ["STUDENT"],
    body: { lessonId: "loops-1", kind: "idle_tick" },
    note: "The child's own keystroke-level activity feed.",
  },
  {
    path: "api/progress",
    method: "POST",
    module: "@/app/api/progress/route",
    allow: ["STUDENT"],
    body: { lessonId: "loops-1", blockCount: 3 },
    note: "A child records their own progress. An adult writing it would be fabricating evidence.",
  },
  {
    path: "api/projects",
    method: "POST",
    module: "@/app/api/projects/route",
    allow: ["STUDENT"],
    body: { lessonId: "loops-1" },
    note: "Saving the child's own .sb3.",
  },
  {
    path: "api/my/lessons",
    method: "GET",
    module: "@/app/api/my/lessons/route",
    allow: ["STUDENT"],
    note: "'My' lessons: the session decides whose, so no other role has a 'my'.",
  },
  {
    path: "api/ai/generate",
    method: "POST",
    module: "@/app/api/ai/generate/route",
    allow: ["STUDENT"],
    body: { prompt: "help with my loop" },
    note: "The only path to the model from a browser. Held to one role on purpose.",
  },
  {
    path: "api/learner/practice",
    method: "POST",
    module: "@/app/api/learner/practice/route",
    allow: ["STUDENT"],
    body: { skill: "loops" },
    note: "Submitting a practice attempt as the child who made it.",
  },
  {
    path: "api/hints/request",
    method: "POST",
    module: "@/app/api/hints/request/route",
    allow: ["STUDENT"],
    body: { lessonId: "loops-1", attempts: 1 },
    note: "The child asking for a hint.",
  },
  {
    path: "api/hints/reply",
    method: "POST",
    module: "@/app/api/hints/reply/route",
    allow: ["STUDENT"],
    body: { hintId: "hint-1", answer: "I tried a forever block" },
    note: "The child answering a hint that asked them a question.",
  },
  {
    path: "api/hints/dismiss",
    method: "POST",
    module: "@/app/api/hints/dismiss/route",
    allow: ["STUDENT"],
    body: { hintId: "hint-1" },
    note: "The child putting a hint away.",
  },
  {
    path: "api/hints/proactive",
    method: "POST",
    module: "@/app/api/hints/proactive/route",
    allow: ["STUDENT"],
    body: { lessonId: "loops-1" },
    note: "Collecting nudges the service queued for this child.",
  },
  {
    path: "api/hints/stream",
    method: "GET",
    module: "@/app/api/hints/stream/route",
    allow: ["STUDENT"],
    note: "The child's own live hint stream.",
  },

  // ---------- teachers only ----------
  // Approval is the hinge of the whole design: nothing the model writes
  // reaches a child until a teacher has read it. So the approve and reject
  // routes are the most security-sensitive in the app, and a student reaching
  // them would mean a child approving their own hints.
  {
    path: "api/hints/pending",
    method: "GET",
    module: "@/app/api/hints/pending/route",
    allow: ["TEACHER"],
    note: "The approval queue, which carries unreviewed model output.",
  },
  {
    path: "api/hints/approve",
    method: "POST",
    module: "@/app/api/hints/approve/route",
    allow: ["TEACHER"],
    body: { hintId: "hint-1" },
    note: "Clearing model output to be shown to a child. Teacher alone.",
  },
  {
    path: "api/hints/reject",
    method: "POST",
    module: "@/app/api/hints/reject/route",
    allow: ["TEACHER"],
    body: { hintId: "hint-1" },
    note: "Refusing model output. Teacher alone.",
  },
  {
    path: "api/hints/auto-approved",
    method: "GET",
    module: "@/app/api/hints/auto-approved/route",
    allow: ["TEACHER"],
    note: "What went out without review, so a teacher can audit it after the fact.",
  },
  {
    path: "api/learner/overview",
    method: "GET",
    module: "@/app/api/learner/overview/route",
    allow: ["TEACHER"],
    note: "Every child in the class at once. Not a parent's view: it crosses families.",
  },
  {
    path: "api/progress/all",
    method: "GET",
    module: "@/app/api/progress/all/route",
    allow: ["TEACHER"],
    note: "Progress across the whole class, for the same reason.",
  },

  // ---------- parents only ----------
  {
    path: "api/parents/children",
    method: "GET",
    module: "@/app/api/parents/children/route",
    allow: ["PARENT"],
    note: "The parent's own children, keyed by the session's parentId.",
  },
  {
    path: "api/parents/children",
    method: "POST",
    module: "@/app/api/parents/children/route",
    allow: ["PARENT"],
    body: { displayName: "Child", ageBand: "9-11", username: "child_one", pin: "1234" },
    note: "A child account is created here and nowhere else, by their own parent.",
  },
  {
    path: "api/progress/parent",
    method: "GET",
    module: "@/app/api/progress/parent/route",
    allow: ["PARENT"],
    note: "The family recap. Scoped to the parent's own children by the session.",
  },

  // ---------- admins only ----------
  {
    path: "api/admin/stats",
    method: "GET",
    module: "@/app/api/admin/stats/route",
    allow: ["ADMIN"],
    note: "Platform-wide counts.",
  },
  {
    path: "api/admin/students",
    method: "GET",
    module: "@/app/api/admin/students/route",
    allow: ["ADMIN"],
    note: "Every child on the platform, across every family.",
  },
  {
    path: "api/admin/parents",
    method: "GET",
    module: "@/app/api/admin/parents/route",
    allow: ["ADMIN"],
    note: "Every parent, with contact details.",
  },
  {
    path: "api/admin/teachers",
    method: "GET",
    module: "@/app/api/admin/teachers/route",
    allow: ["ADMIN"],
    note: "Staff list.",
  },
  {
    path: "api/admin/teachers",
    method: "POST",
    module: "@/app/api/admin/teachers/route",
    allow: ["ADMIN"],
    body: { name: "A Teacher", email: "teacher@example.com", password: "a-long-password" },
    note: "Creating staff. A teacher must not be able to create a colleague.",
  },
  {
    path: "api/admin/teachers/[id]",
    method: "GET",
    module: "@/app/api/admin/teachers/[id]/route",
    allow: ["ADMIN"],
    params: { id: "teacher-1" },
    note: "One staff record.",
  },
  {
    path: "api/admin/teachers/[id]",
    method: "PUT",
    module: "@/app/api/admin/teachers/[id]/route",
    allow: ["ADMIN"],
    params: { id: "teacher-1" },
    body: { name: "A Teacher", email: "teacher@example.com" },
    note: "Editing staff, including the email they sign in with.",
  },
  {
    path: "api/admin/teachers/[id]",
    method: "DELETE",
    module: "@/app/api/admin/teachers/[id]/route",
    allow: ["ADMIN"],
    params: { id: "teacher-1" },
    note: "Removing staff.",
  },
  {
    path: "api/admin/courses",
    method: "GET",
    module: "@/app/api/admin/courses/route",
    allow: ["ADMIN"],
    note: "The catalogue as the panel edits it, drafts included.",
  },
  {
    path: "api/admin/courses",
    method: "POST",
    module: "@/app/api/admin/courses/route",
    allow: ["ADMIN"],
    body: { title: "A Course", description: "About the course" },
    note: "Creating a course.",
  },
  {
    path: "api/admin/courses/[id]",
    method: "GET",
    module: "@/app/api/admin/courses/[id]/route",
    allow: ["ADMIN"],
    params: { id: "course-1" },
    note: "One course, for editing.",
  },
  {
    path: "api/admin/courses/[id]",
    method: "PUT",
    module: "@/app/api/admin/courses/[id]/route",
    allow: ["ADMIN"],
    params: { id: "course-1" },
    body: { title: "A Course", description: "About the course" },
    note: "Editing a course.",
  },
  {
    path: "api/admin/courses/[id]",
    method: "DELETE",
    module: "@/app/api/admin/courses/[id]/route",
    allow: ["ADMIN"],
    params: { id: "course-1" },
    note: "Deleting a course.",
  },
  {
    path: "api/admin/lessons",
    method: "GET",
    module: "@/app/api/admin/lessons/route",
    allow: ["ADMIN"],
    note: "Lessons for a course, in order.",
  },
  {
    path: "api/admin/lessons",
    method: "POST",
    module: "@/app/api/admin/lessons/route",
    allow: ["ADMIN"],
    body: { courseId: "course-1", title: "A Lesson", orderNo: 1 },
    note: "Creating a lesson, which is content a child will be shown.",
  },
  {
    path: "api/admin/lessons/[id]",
    method: "GET",
    module: "@/app/api/admin/lessons/[id]/route",
    allow: ["ADMIN"],
    params: { id: "lesson-1" },
    note: "One lesson, for editing.",
  },
  {
    path: "api/admin/lessons/[id]",
    method: "PUT",
    module: "@/app/api/admin/lessons/[id]/route",
    allow: ["ADMIN"],
    params: { id: "lesson-1" },
    body: { title: "A Lesson", orderNo: 1 },
    note: "Editing lesson content.",
  },
  {
    path: "api/admin/lessons/[id]",
    method: "DELETE",
    module: "@/app/api/admin/lessons/[id]/route",
    allow: ["ADMIN"],
    params: { id: "lesson-1" },
    note: "Deleting a lesson.",
  },

  // ---------- any signed-in role ----------
  // These do their own narrowing inside the handler, by family or by child,
  // which is tested separately below the matrix. The matrix only says that
  // being signed in is the price of entry.
  {
    path: "api/learner/[studentId]",
    method: "GET",
    module: "@/app/api/learner/[studentId]/route",
    allow: "ANY",
    params: { studentId: "student-1" },
    note: "A child's skill profile. The URL says which child, the session says whether you may; a student may only read their own.",
  },
  {
    path: "api/hints/for-student",
    method: "GET",
    module: "@/app/api/hints/for-student/route",
    allow: "ANY",
    note: "Approved hints for a child: the child, their parent, or a teacher.",
  },
  {
    path: "api/learner/next",
    method: "POST",
    module: "@/app/api/learner/next/route",
    allow: "ANY",
    body: { studentId: "student-1" },
    note: "The next step for a child. A student may only ask about themselves.",
  },

  // ---------- signed in, but not a child ----------
  // Being signed in is not enough and the role that is excluded is the one
  // the data is about, which is the opposite shape from everything above.
  {
    path: "api/cohorts",
    method: "GET",
    module: "@/app/api/cohorts/route",
    allow: ["TEACHER", "PARENT", "ADMIN"],
    note: "Which classes are running. A child is told to ask an adult.",
  },
  {
    path: "api/enrolments",
    method: "POST",
    module: "@/app/api/enrolments/route",
    allow: ["TEACHER", "PARENT", "ADMIN"],
    body: { studentId: "student-1", cohortId: "cohort-1" },
    note: "A teacher may enrol anyone, a parent only their own child, a student not themselves.",
  },
];

// Routes that exist but are not driven through the matrix, with the reason.
// The coverage test reads this, so nothing can be quietly left out: skipping a
// route means writing down why, here, where it is reviewable.
export const NOT_IN_MATRIX: Record<string, string> = {
  "app/api/auth/[...nextauth]/route.ts":
    "NextAuth's own handler. It is the thing that issues sessions, so it has no session to check and nothing of ours to test; its configuration is covered by the auth tests instead.",
};

export function allowedFor(route: RouteCase): Role[] {
  if (route.allow === "PUBLIC" || route.allow === "ANY") return [...ROLES];
  return route.allow;
}

export function describeCase(route: RouteCase): string {
  return `${route.method} /${route.path}`;
}
