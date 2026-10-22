/**
 * Signs the seeded child in once, and saves the session for every test to
 * reuse.
 *
 * Written as a setup project rather than a beforeEach because signing in is
 * not what the journey is testing, and doing it per test cost more than
 * everything else put together: each sign-in is a bcrypt comparison, a round
 * trip to a serverless database that may be cold, and a Next dev server
 * compiling whichever route is being reached for the first time. Eleven of
 * those ran the suite past its timeouts and reported it as the application
 * being broken.
 *
 * The tests that must be anonymous opt out of this with an empty storageState,
 * which is why the sign-in form is still exercised in the journey itself.
 */

import { expect, test as setup } from "@playwright/test";
import { STUDENT_STATE } from "./paths";

const CHILD_USERNAME = process.env.E2E_STUDENT_USERNAME ?? "alice123";
const CHILD_PIN = process.env.E2E_STUDENT_PIN ?? "1234";

setup("sign in as the seeded child", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Username or email").fill(CHILD_USERNAME);
  await page.getByLabel("Password or PIN").fill(CHILD_PIN);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Landing on the dashboard is the signal: the form reads the session back to
  // find the role before it redirects, so this only happens once the cookie is
  // really set and really carries a student.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/^Hi /);

  await page.context().storageState({ path: STUDENT_STATE });
});
