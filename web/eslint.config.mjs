import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not ours to lint, and ruinous to try.
    //
    // public/scratch-editor is the vendored Scratch editor: bundled,
    // minified, third-party JavaScript. Linting it ran the process out of
    // heap and took `npm run lint` down with it, so the command could not
    // complete at all, let alone in CI.
    "public/scratch-editor/**",
    // Generated from schema.prisma by `prisma generate` on every install.
    // Nothing here is hand-written, and any complaint about it is a complaint
    // about Prisma's code generator.
    "generated/**",
    // Playwright's own output.
    "playwright-report/**",
    "test-results/**",
    // A stray nested build directory: web/web/.next. The ".next/**" pattern
    // above only matches the one at this level, so without this the linter
    // reports thousands of problems in compiled Next.js chunks.
    "web/.next/**",
  ]),
]);

export default eslintConfig;
