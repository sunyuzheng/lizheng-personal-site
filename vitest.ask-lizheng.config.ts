import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "client/src/lib/ask-lizheng.test.ts",
      "tests/ask-lizheng-relay.test.ts",
    ],
    pool: "forks",
    minWorkers: 1,
    maxWorkers: 1,
  },
});
