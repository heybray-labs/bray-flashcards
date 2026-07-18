import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.tsx"],
    server: {
      deps: {
        inline: ["@heybray/gamification-react", "@heybray/react"],
      },
    },
  },
});
