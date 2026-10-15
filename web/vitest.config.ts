import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest, not Jest, because the app is ESM and TypeScript throughout and this
// needs no transform configuration to run a route handler.
//
// Only tests/ is picked up. The repo also holds the AI service's pytest suite,
// and a wider glob would try to collect Python.
export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json so a test can import a
    // route by the same specifier the route itself uses.
    alias: { "@": path.resolve(__dirname, "./") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
