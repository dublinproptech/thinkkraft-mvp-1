// Where the saved session lives.
//
// Its own module, imported by both the config and the setup project, because
// playwright.config.ts is loaded before any test file: importing this from
// auth.setup.ts made Playwright parse a test while it was still reading the
// config, and it refused the whole run.
import path from "node:path";

export const STUDENT_STATE = path.join(__dirname, "../../playwright/.auth/student.json");
