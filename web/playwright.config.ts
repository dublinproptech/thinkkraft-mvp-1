import { defineConfig, devices } from "@playwright/test";
import { STUDENT_STATE } from "./tests/e2e/paths";

// End-to-end tests run against a real build, a real session and the real
// database. That is the point of them: everything below this layer is already
// covered by tests that mock their way past it, and the bugs those cannot see
// are the ones where middleware, NextAuth, the route guards and Prisma
// disagree with each other.
//
// Set E2E_BASE_URL to point at an already-running app, which is also how this
// runs against a deployed environment. With nothing set, a dev server is
// started here on E2E_PORT.
//
// The port is 3100 and not 3000 on purpose. 3000 is where the app is served
// during development and it is also the default for a great many other things;
// the first run of this suite reused whatever was already listening there and
// tested a local Grafana's login form instead of ThinkKraft's, reporting it as
// eleven application failures. A dedicated port means the suite either gets
// the server it started or none at all.
const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Serial by default. These sign in as the seeded child, and a second worker
  // signing in as the same child at the same time is a race nobody asked for.
  workers: 1,
  fullyParallel: false,
  // A flake re-run in CI, never locally, so a flaky test is visible while it
  // is being written rather than hidden behind a retry.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // Generous, because the slow parts are not the app's fault and not what is
  // being measured: a Next dev server compiles each route the first time it is
  // asked for, and a serverless database may be cold. Against a production
  // build, as CI runs it, these are never approached.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: BASE_URL,
    // Kept only for failures: a passing run does not need a video of itself.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // Signs the child in once and saves the cookie. Everything else starts
    // already signed in, and the tests that must not be opt out per file.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STUDENT_STATE },
      dependencies: ["setup"],
    },
    // Schools hand children tablets, so the student journey is worth running
    // at that size too. Enable once the journey is green on desktop.
    // {
    //   name: "tablet",
    //   use: { ...devices["iPad (gen 7)"], storageState: STUDENT_STATE },
    //   dependencies: ["setup"],
    // },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: BASE_URL,
        // Never inherit a stranger's server. If something is already on this
        // port, failing to start is the right outcome: it is a far cheaper
        // failure than a green run against the wrong application.
        reuseExistingServer: false,
        // A cold Next dev server compiling the first route takes a while.
        timeout: 300_000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          // .env.local points NEXTAUTH_URL at port 3000. NextAuth builds its
          // callback and sign-out URLs from this, so on a different port it
          // has to be told, or sign-out lands on an origin with no session
          // cookie and the test reads it as a failure to sign out.
          NEXTAUTH_URL: BASE_URL,
        },
      },
});
