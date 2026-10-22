# ThinkKraft — Test Strategy and Results

Quality documentation for the ThinkKraft MVP: what is tested, how, why those
choices, what passed, and what is deliberately not covered yet.

---

## 1. System under test

| Layer | Technology | Test approach |
|---|---|---|
| Web core | Next.js 16 (App Router, TypeScript) | Vitest unit/integration, Playwright E2E |
| AI service | Python 3.11, FastAPI | pytest unit + endpoint integration |
| Database | Neon serverless PostgreSQL via Prisma 7 | Exercised through E2E; mocked below that |
| Model | Google Gemini 2.5 Flash-Lite, Ollama fallback | Always mocked; fallback paths asserted |
| Packaging | Docker, docker-compose | Image build verified in CI |

Four roles exist — `STUDENT`, `TEACHER`, `PARENT`, `ADMIN` — and the product
handles children's data, which sets the priorities throughout: access control
and model-output safety are tested harder than anything else.

---

## 2. Test inventory and results

All figures below are from a full local run. Every suite passes.

| Suite | Location | Tests | Result |
|---|---|---|---|
| Parser units | `ai-service/test_sb3_parser.py` | 11 | Pass |
| Planner units | `ai-service/test_planner.py` | 20 | Pass |
| Learner-model units | `ai-service/test_learner_model.py` | 21 | Pass |
| Governor units | `ai-service/test_governor.py` | 27 | Pass |
| AI service endpoints | `ai-service/test_api.py` | 65 | Pass |
| **AI service total** | | **144** | **Pass** (0.40s) |
| Authorization matrix | `web/tests/authorization.test.ts` | 255 | Pass (0.9s) |
| Student journey (E2E) | `web/tests/e2e/student-journey.spec.ts` | 14 | Pass (13.3s) |
| **Total** | | **413** | **Pass** |

Static analysis: `tsc --noEmit` clean; ESLint 0 errors.

### How to run

```bash
# AI service
cd ai-service
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python -m pytest -q

# Web core: units, authorization matrix, types, lint
cd web
npm ci --legacy-peer-deps
npm test
npm run typecheck
npm run lint

# End-to-end (needs a database and a seeded child)
npm run test:e2e
```

---

## 3. Test design techniques applied

**Boundary value analysis** — `test_governor.py`. The hint governor enforces
three numeric rules, each tested at the threshold and on both sides of it:

| Rule | Threshold | Cases |
|---|---|---|
| Cooldown between nudges | 120s | 119.9s blocked · exactly 120s allowed · 180s allowed |
| Nudges per session | 5 | 4 allowed · exactly 5 blocked · no reset with time |
| In-flow suppression after an edit | 15s | 14.9s blocked · exactly 15s allowed · 25s allowed |

All three comparisons are strict (`<`), so the threshold itself falls on the
permissive side, and the tests assert that rather than assuming it.

**Equivalence partitioning** — callers are partitioned into five classes
(4 roles + anonymous) and every route is tested against each.

**Decision-table testing** — the governor's three rules are also tested for
*precedence*, not only outcome: when two rules both fail, the reason code
returned must be the right one, since that is what gets logged and shown to a
teacher.

**State-transition testing** — the learner model is Bayesian Knowledge Tracing,
so mastery is a state machine driven by evidence. Tests assert direction
(correct raises, wrong lowers), hint discounting (unaided > level-2 > level-3
success), and that unmentioned skills are untouched.

**Negative and malformed-input testing** — non-ZIP uploads, oversized uploads,
missing required parameters, wrong types, empty bodies, trailing commas in
query strings.

**Mutation testing (manual, as a sanity check)** — the authorization suite was
validated by deliberately weakening a guard: changing `requireAdmin()` to
`requireSession()` in `web/lib/adminRoute.ts` produced exactly 54 failures
(18 admin route-cases × 3 non-admin roles). The guard was then restored. This
matters because a green access-control suite that asserts nothing is worse than
no suite at all.

---

## 4. Layer 1 — Unit tests

Pure logic, no I/O, no network. 79 of the 144 AI-service tests.

Covered: `.sb3` parsing (connected vs. loose blocks), the checker's
teaching-order diagnosis, the hint ladder and its guardrail, mastery updates
and thresholds, planner root-cause selection, and the proactive governor.

Two properties worth calling out because they are product claims rather than
implementation details:

- **Loose blocks are not a finished project.** A green flag, an empty loop and
  a stray move block, none connected, does nothing when clicked. An earlier
  version marked this correct because it only checked which opcodes existed.
- **Root-cause teaching.** A child failing at loops whose *motion* is weak is
  taught motion, not loops, because a child cannot loop a movement they cannot
  reliably produce.

---

## 5. Layer 2 — Integration tests

### 5.1 AI service endpoints (`test_api.py`, 65 tests)

All ten routes driven through FastAPI's `TestClient`, so request models,
parameter binding, module wiring and response envelopes are exercised rather
than the functions behind them.

| Route | What is asserted |
|---|---|
| `GET /health` | Status and service name, so a misrouted proxy is visible |
| `GET /ollama-check` | Never raises, never 500s; envelope valid either way |
| `POST /parse` | Correct project passes; earliest gap diagnosed; hint level escalates with attempts (1→1, 2→2, 3+→3); malformed file returns a message; oversized upload returns 413; missing params return 422 |
| `GET /content/{skill}` | Approval gate withholds unapproved text; unknown skill is absent, not an error |
| `POST /practice/check` | Signal matching, missing-signal naming, empty list, malformed file |
| `POST /activity` | Idle and repeated-run detection; governor blocking with reason; per-child isolation; schema rejection |
| `GET /proactive/{id}` | Queue drains once; per-child isolation |
| `POST /learner/update` | Direction of movement, hint discounting, skill-less evidence ignored, level words agree with the numbers sent beside them |
| `POST /learner/next` | Root cause over symptom; struggling child never advanced; rewording off by default; worked example never reworded; unsafe rewording discarded |
| `POST /followup` | Next rung of the same ladder; cannot exceed level 3; proactive follow-up never reaches the model; unknown diagnosis yields no hint |

### 5.2 Authorization matrix (`web/tests/authorization.test.ts`, 255 tests)

Broken access control is OWASP A01 and the highest-risk area in this product.
The matrix is a hand-written specification (`authorizationMatrix.ts`) of who may
call what, driven against every caller class.

**48 route-and-method cases × 5 caller classes = 240 assertions**, plus 11
ownership tests and 4 coverage guards: **255 total.**

It is hand-written on purpose. A matrix generated from the route files would
agree with the code by construction — *including where the code is wrong* —
which is the one thing an access-control test must never do.

Distribution of the 48 cases:

| Policy | Cases | Examples |
|---|---|---|
| Public | 5 | `/api/health`, `/api/courses`, `/api/auth/register` |
| Student only | 11 | `/api/activity`, `/api/progress`, `/api/ai/generate` |
| Teacher only | 6 | `/api/hints/approve`, `/api/hints/pending`, `/api/progress/all` |
| Parent only | 3 | `/api/parents/children`, `/api/progress/parent` |
| Admin only | 18 | all of `/api/admin/*` |
| Any signed-in role | 3 | `/api/learner/[studentId]`, `/api/hints/for-student` |
| Signed in, not a child | 2 | `/api/cohorts`, `/api/enrolments` |

Status codes are asserted distinctly: **401** for anonymous (nothing is
forbidden; they have not said who they are) and **403** for a signed-in caller
of the wrong role. A route answering 403 to an anonymous caller leaves the
browser with no way forward, so the distinction is load-bearing, not cosmetic.

**Ownership checks**, which a role matrix cannot express, are tested separately:
role alone does not settle whether a parent may read *this* child.

- A student cannot read another child's skill profile or next step
- A student cannot enrol themselves
- A student never names a student id; the query parameter is ignored for them
- A parent cannot read or enrol a child who is not theirs
- A parent is asked which child rather than defaulting to all
- A teacher may cross families **by design** — recorded as an explicit,
  reviewable decision rather than left as an accident

**Three coverage guards** keep the matrix honest as the app grows:

1. Every route file on disk is listed, or recorded in `NOT_IN_MATRIX` with a
   written reason
2. No listed route has stopped existing
3. Every HTTP verb each route exports is driven — a file exporting `POST` while
   the matrix lists only its `GET` is a whole verb nobody is checking

---

## 6. Layer 3 — End-to-end tests

`web/tests/e2e/student-journey.spec.ts` — 14 tests, Playwright + Chromium,
against a real build, a real NextAuth session and the real database.

| Group | Tests |
|---|---|
| Arriving as a stranger | Guarded page redirects to sign-in and remembers the destination; wrong details give a message that does not reveal which half was wrong; unauthenticated API call returns 401 |
| A child's session | Lands on own dashboard, greeted by name; opens a lesson and gets the editor, the tutor and the skills panel; can read own lessons, own profile and own next step |
| What a child must not reach | Another child's profile (403); another child's next step (403); admin data (403); teacher area (redirected); approval queue (403); class-wide views (403) |
| Signing out | Session ends and the guarded page is guarded again |

**Scope boundaries, and the reasons:**

- **The Scratch editor is not driven.** It is vendored third-party code in an
  iframe. Driving its canvas would be the most brittle test in the repo and
  would be testing Scratch, not ThinkKraft. The test asserts the editor is
  mounted and the tutor is beside it; what arrangement of blocks means what is
  already pinned down exactly by 11 parser unit tests.
- **Nothing writes.** "Check my work" is asserted present and enabled, not
  clicked: clicking records a hint event against a real child in a real
  database and calls the AI service. A journey that needs cleaning up after is
  a journey nobody runs twice.
- **Data-independent assertions.** Where a view depends on seeded state, both
  the populated and the empty state are accepted. Whether a child is enrolled,
  or has attempted a skill, is a property of the data, not of the application.

**Session reuse.** Sign-in happens once in a setup project and the cookie is
reused. Signing in per test cost more than everything else combined — each one
is a bcrypt comparison plus a round trip to a serverless database plus a dev
server compiling a route for the first time. The two tests that must be
anonymous opt out with an empty storage state, so the sign-in form stays
covered.

---

## 7. Continuous integration

`.github/workflows/tests.yml` — four jobs, on every push and pull request.

| Job | Runs | Needs secrets |
|---|---|---|
| `ai-service` | pytest on Python 3.11, matching the Dockerfile | No |
| `web-checks` | ESLint, `tsc --noEmit`, Vitest (units + authorization matrix) | No |
| `build` | `docker build` for both images | No |
| `e2e` | migrate, seed, production build, Playwright | Yes |

Design decisions:

- The first three jobs need no database and no secrets, so they run on forks.
- The E2E job is **gated on a test database being configured** and skips with a
  visible notice otherwise. A job that fails for want of a secret teaches
  everyone to ignore a red tick.
- E2E runs against a **production build**, not the dev server: that is what
  gets deployed, and middleware behaves differently enough between the two to
  be worth the build step.
- The container build is its own job because the most recent run of deployment
  fixes were all Dockerfile changes. A green test suite beside an image that
  will not build is a deploy that fails after everything looked fine.
- Retries are **CI-only**. Locally a flaky test stays visibly flaky instead of
  hiding behind a retry.
- `concurrency` cancels superseded runs on the same ref.

---

## 8. Defects and issues found

Found while building the suite, all in test or build configuration rather than
product logic.

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | `npm run lint` crashed with a JavaScript heap out-of-memory and could not complete at all. The flat ESLint config overrides the default ignores, so ESLint was linting `public/scratch-editor/**` — 273 MB of vendored, minified Scratch editor. | High (blocked lint in CI entirely) | Fixed — ignores added for the vendored editor, the generated Prisma client, and Playwright output |
| 2 | A stray nested build directory `web/web/.next` produced 4,435 lint warnings from compiled Next.js chunks. | Low | Ignored in lint config; the directory itself (14 MB) is left in place as it is not a test concern |
| 3 | The committed `ai-service/venv/` is a **Windows** virtual environment (`Lib/`, `Scripts/`) and is unusable on macOS or Linux, including in CI. | Medium | Not changed — a fresh environment was created for the test run. Recommend removing it from the repository; `.gitignore` already excludes `venv/` |
| 4 | The first E2E run reused a **Grafana** instance already listening on `localhost:3000` and tested its login form, reporting 11 application failures that were nothing of the kind. | High (false results) | Fixed — E2E now uses a dedicated port (3100) and never reuses a foreign server |
| 5 | The main workspace test silently skipped itself: `isVisible()` does not wait, and the dashboard loads lessons after render, so it always saw an empty page. | High (silent non-coverage) | Fixed — waits for the page to settle before deciding, and only skips on a genuinely empty dashboard |
| 6 | An E2E assertion demanded skill-level words that only appear once a child has attempted a skill, failing against a freshly seeded child. | Medium (false failure) | Fixed — accepts the populated or the empty state |

Issues 4, 5 and 6 are recorded deliberately: each is a case of a test suite
reporting something untrue, which is the failure mode that matters most in a
quality process. A suite that lies in either direction is worse than no suite.

---

## 9. Known gaps — not covered

Stated plainly rather than implied to be complete.

**Not implemented in the product, so nothing to test:**

- **Struggle notification.** Struggle *detection* exists and is tested: BKT
  produces per-skill mastery, `"needs help"` at or below 0.4, persisted as
  `SkillMastery.level = LEARNING`, and all three audiences can see it
  (child via the workspace skills panel, teacher via the skills overview,
  parent via the weekly recap). But it is a dashboard you visit, not a
  notification that reaches you: there is no `Notification` model in the
  schema, nothing fires on a `MASTERED/PRACTISING → LEARNING` transition, and
  no email, push or inbox exists. The parent recap also shows only one
  struggling skill (`take: 1`), not the full list of topics.

**Not yet tested:**

| Area | Note |
|---|---|
| Teacher, parent and admin E2E journeys | Only the student journey exists. The approval queue in particular deserves one, being the hinge of the design |
| Route handler bodies | The matrix asserts guard verdicts, not what a handler does once past the guard. Happy-path behaviour below the guard is covered only where the E2E journey reaches it |
| Database layer (`web/lib/db/*`) | Mocked everywhere; no integration tests against a real schema |
| Accessibility | No axe-core or Lighthouse pass. Mandatory for education procurement |
| Cross-browser and tablet | Chromium only. Schools issue tablets; a tablet project is scaffolded but commented out |
| Performance and load | No k6/Locust. `/activity` and `/proactive/{id}` fire repeatedly during a live session; a 30-child classroom is untested |
| AI golden-set regression | Prompt or model changes are not caught by a fixed set of expected hint categories |
| Child-safety of generated text | The deterministic guardrails are well tested, but the model's actual output is not screened for unsafe or off-topic content |
| Consent and privacy enforcement | A `Consent` model and a parent consent page exist; that consent actually gates collection, and that revoking it stops collection, is untested. In scope for COPPA/GDPR-K |
| Data erasure | `web/lib/db/erasure.ts` has no tests |
| Rate limiting and abuse | No tests for repeated hint requests or upload flooding |

**Recommended next, in order:** teacher approval-queue E2E · consent
enforcement tests · accessibility pass · AI golden-set regression · load test
of the activity endpoints.

---

## 10. Test artifacts

| File | Purpose |
|---|---|
| `ai-service/test_governor.py` | Proactive-nudge rules, boundary values |
| `ai-service/test_api.py` | All ten FastAPI endpoints |
| `web/tests/authorizationMatrix.ts` | The access-control specification |
| `web/tests/authorization.test.ts` | Driver for the matrix |
| `web/tests/setup.ts` | Test environment; no real credentials |
| `web/tests/e2e/student-journey.spec.ts` | The student journey |
| `web/tests/e2e/auth.setup.ts` | Signs in once, saves the session |
| `web/vitest.config.ts` | Vitest configuration |
| `web/playwright.config.ts` | Playwright configuration |
| `.github/workflows/tests.yml` | CI pipeline |

Failure diagnostics are retained on failure only: trace, screenshot and video
for E2E, with the HTML report uploaded as a CI artifact and kept for 7 days.
A passing run keeps nothing.
