import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "client/src/lib/ask-lizheng.test.ts",
      "tests/ask-lizheng-relay.test.ts",
      "tests/ask-access.test.ts",
      "tests/ask-auth.test.ts",
      "tests/ask-email-otp.test.ts",
      "tests/ask-quota-storage.test.ts",
      "tests/ask-query-storage.test.ts",
      "tests/ask-logto-requester.test.ts",
      "tests/ask-ops-gateway.test.ts",
      "tests/ask-discovery-gateway.test.ts",
      "tests/ask-discovery-pick.test.ts",
      "tests/ask-usage.test.ts",
      "tests/ask-archive.test.ts",
      "tests/ask-lizheng-page.test.ts",
      "tests/ask-public-page.test.ts",
      "tests/api-imports.test.ts",
    ],
    pool: "forks",
    minWorkers: 1,
    maxWorkers: 1,
  },
});
