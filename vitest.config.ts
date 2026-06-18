import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    // The dev database is a remote Postgres (Supabase), so each query is a
    // network round-trip. Raise the default 5s timeout to avoid flaky failures.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});