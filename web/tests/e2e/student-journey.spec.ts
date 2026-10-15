/**
 * The student happy path, through a browser, against the real stack.
 *
 * One journey: a child arrives, is sent to sign in, signs in, lands on their
 * own dashboard, opens a lesson, and gets a workspace with the tutor and their
 * skills on it. Then the things that must not work for them.
 *
 * Most tests here start already signed in, from the session auth.setup.ts
 * saved. The two that are about signing in clear it, which is why the form is
 * still covered.
 *
 * Scope, and why it stops where it does.
 *
 * The Scratch editor is a third party loaded in an iframe. Driving its canvas
 * from here would be the most brittle test in the repo and would be testing
 * Scratch rather than ThinkKraft, so this asserts the editor is mounted and
 * the tutor is on the page beside it, and leaves block-dragging to the parser
 * tests, which already know exactly what arrangement of blocks means what.
 *
 * Nothing here writes. "Check my work" is asserted to be present and usable,
 * not clicked: clicking it records a hint event against a real child in a real
 * database and calls the AI service. A journey that has to be cleaned up after
 * is a journey nobody runs twice, so the write path is left to the service
 * tests, which can be as destructive as they like against their own fixtures.
 *
 * Credentials come from the seed (web/prisma/seed.ts), which creates the child
 * alice123 with PIN 1234 for local development. Override them in the
 * environment to run against anything else.
 */

import { expect, test, type Page } from "@playwright/test";

const CHILD_USERNAME = process.env.E2E_STUDENT_USERNAME ?? "alice123";
const CHILD_PIN = process.env.E2E_STUDENT_PIN ?? "1234";

// Someone else's child. The id is deliberately not a real one: the assertion
// is that the request is refused before anything is looked up, so a profile
// that does not exist is the strongest version of the test — a 403 proves the
// guard answered, where a 404 would only prove the row was missing.
const ANOTHER_CHILD = "not-this-childs-id";

// No cookie at all, for the tests that are about arriving as a stranger.
const ANONYMOUS = { cookies: [], origins: [] };

test.describe("arriving as a stranger", () => {
  test.use({ storageState: ANONYMOUS });

  test("is asked to sign in before the workspace, and sent back to it after", async ({
    page,
  }) => {
    // Middleware, not the page. The page's own check is cosmetic: it runs after
    // the page has already been sent.
    await page.goto("/workspace?lessonId=loops-1");

    await expect(page).toHaveURL(/\/login/);
    // The destination is remembered, so a child who was linked straight to a
    // lesson lands on that lesson and not on a generic home page.
    expect(new URL(page.url()).searchParams.get("callbackUrl")).toContain("/workspace");

    await page.getByLabel("Username or email").fill(CHILD_USERNAME);
    await page.getByLabel("Password or PIN").fill(CHILD_PIN);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/workspace/, { timeout: 60_000 });
  });

  test("is told plainly when the details are wrong", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username or email").fill(CHILD_USERNAME);
    await page.getByLabel("Password or PIN").fill("0000");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Which half was wrong is not said, and must not be: that would confirm
    // the username exists to whoever is guessing.
    await expect(page.getByText(/could not sign you in/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("cannot read a child's data without signing in", async ({ page }) => {
    // 401 and not 403: nothing has been forbidden, they have not said who they
    // are, and the browser needs to know the difference to send them to a
    // sign-in page rather than a dead end.
    const res = await page.request.get(`/api/learner/${ANOTHER_CHILD}`);
    expect(res.status()).toBe(401);
  });
});

test.describe("a child's session", () => {
  test("lands on their own dashboard and sees their lessons", async ({ page }) => {
    await page.goto("/dashboard");

    // Greeted by name, which comes from the student profile row rather than
    // from an email, because a child account has no email.
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/^Hi /);

    // Either real lessons or the honest empty state. Both are a pass: whether
    // this child is enrolled is a property of the data, not of the app, and a
    // test that demands enrolment breaks the first time someone reseeds.
    const lessons = page.getByRole("link", { name: /Start lesson|Open again/ });
    const empty = page.getByText(/You are not in a class yet/);

    await expect(lessons.first().or(empty)).toBeVisible();
  });

  test("opens a lesson and gets the editor, the tutor and their skills", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // The lessons arrive from /api/my/lessons after the page renders, so the
    // page has to be allowed to settle before anything is decided about it.
    // Asking isVisible() straight after goto() is a question about the loading
    // state, and it answered "no lessons" every time: this test skipped itself
    // on a dashboard that was about to be full.
    const start = page.getByRole("link", { name: /Start lesson|Open again/ }).first();
    const empty = page.getByText(/You are not in a class yet/);
    await expect(start.or(empty)).toBeVisible();

    // Only now is an empty dashboard really empty, and only then is skipping
    // honest: this child is in no class, so there is no lesson to open.
    test.skip(
      await empty.isVisible(),
      "This child is not enrolled in a course, so there is no lesson to open.",
    );

    await start.click();
    await expect(page).toHaveURL(/\/workspace\?lessonId=/);
    await expect(page.getByRole("heading", { name: "Build your project" })).toBeVisible();

    // The lesson is named on the page, so a child can tell which one they are in.
    const lessonId = new URL(page.url()).searchParams.get("lessonId")!;
    await expect(page.getByText(`Lesson ${lessonId}`)).toBeVisible();

    // The editor is mounted. Its contents are Scratch's business.
    await expect(page.locator('iframe[title="ThinkKraft Scratch Editor"]')).toBeVisible();

    // The tutor is on the page and offering to look at their work. Asserted
    // enabled as well as visible: a permanently disabled button is the same as
    // no tutor at all from the child's side.
    const check = page.getByRole("button", { name: "Check my work" });
    await expect(check).toBeVisible();
    await expect(check).toBeEnabled();

    // And the longer-run view: what they are getting good at.
    //
    // The panel lists only skills the child has actually attempted, so a child
    // who has not pressed "Check my work" yet gets the empty state instead of a
    // row of levels. Both are correct and which one appears is a property of
    // the data, so the assertion is that the panel is there and says one of the
    // two honest things. An earlier version of this demanded the level words
    // and failed against a freshly seeded child, reporting working software as
    // broken.
    await expect(page.getByText("My skills")).toBeVisible();

    const levels = page.getByText(/needs help|getting there|confident|not started/).first();
    const nothingYet = page.getByText(/Nothing here yet/);
    await expect(levels.or(nothingYet)).toBeVisible();
  });

  test("can read their own lessons and their own next step", async ({ page }) => {
    const mine = await page.request.get("/api/my/lessons");
    expect(mine.status()).toBe(200);

    const own = await studentIdFromSession(page);
    expect(own, "the session carries a studentId").toBeTruthy();

    const next = await page.request.post("/api/learner/next", {
      data: { studentId: own },
    });
    expect(next.status()).not.toBe(403);

    const profile = await page.request.get(`/api/learner/${own}`);
    expect(profile.status()).toBe(200);
  });
});

test.describe("what a child must not be able to reach", () => {
  // The same properties the authorization matrix asserts against a mocked
  // session, re-checked here through the real one. The matrix proves the guards
  // are written correctly; this proves they are actually wired in, with real
  // middleware, a real JWT and a real database behind them. A guard that is
  // right and unreachable passes the first and fails this.

  test("another child's skill profile is refused", async ({ page }) => {
    const res = await page.request.get(`/api/learner/${ANOTHER_CHILD}`);
    expect(res.status()).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("not your"),
    });
  });

  test("another child's next step is refused", async ({ page }) => {
    const res = await page.request.post("/api/learner/next", {
      data: { studentId: ANOTHER_CHILD },
    });
    expect(res.status()).toBe(403);
  });

  test("the admin panel's data is refused", async ({ page }) => {
    // 403 and not a redirect: this is an API route, and a child's fetch getting
    // HTML back would be a different bug wearing the same status code.
    const res = await page.request.get("/api/admin/stats");
    expect(res.status()).toBe(403);
  });

  test("the teacher area is not reachable in a browser", async ({ page }) => {
    await page.goto("/teacher");
    // Middleware sends them home rather than showing an error, which for a
    // nine year old who clicked the wrong thing is the right behaviour.
    await expect(page).not.toHaveURL(/\/teacher$/);
  });

  test("the approval queue is refused", async ({ page }) => {
    // The hinge of the design: a child approving their own hints would take a
    // teacher out of the loop entirely.
    expect((await page.request.get("/api/hints/pending")).status()).toBe(403);
    expect(
      (await page.request.post("/api/hints/approve", { data: { hintId: "any" } })).status(),
    ).toBe(403);
  });

  test("a class-wide view is refused", async ({ page }) => {
    // These cross families, which is the whole reason they are a teacher's and
    // not a child's.
    expect((await page.request.get("/api/learner/overview")).status()).toBe(403);
    expect((await page.request.get("/api/progress/all")).status()).toBe(403);
  });
});

test.describe("signing out", () => {
  test("ends the session", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /sign out/i }).click();

    // Signed out means the guarded page is guarded again, which is a stronger
    // assertion than whatever the page looks like afterwards.
    await expect(page).toHaveURL(/\/$|\/login/, { timeout: 60_000 });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

// The signed-in child's own id, read from the session endpoint rather than
// assumed from the seed, so these tests survive a reseed.
async function studentIdFromSession(page: Page): Promise<string> {
  const res = await page.request.get("/api/auth/session");
  const session = await res.json();
  return session?.user?.studentId ?? "";
}
