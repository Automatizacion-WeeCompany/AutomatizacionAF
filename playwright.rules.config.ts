import { defineConfig } from "@playwright/test";
import path from "node:path";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: path.join(__dirname, "src/tests/reglas"),
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  workers: isCI ? 4 : undefined,
  retries: 0,
  forbidOnly: isCI,
  reporter: isCI ? [["dot"]] : [["list"]],
  use: {
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
