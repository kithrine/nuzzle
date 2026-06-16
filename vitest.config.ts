import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // Playwright owns e2e/**; Vitest only runs component/unit tests.
    exclude: ["node_modules", "e2e/**"],
  },
});
