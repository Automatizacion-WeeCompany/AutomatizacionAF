import { defineConfig } from "@playwright/test";
import path from "node:path";
import configBase from "./src/configuraciones/playwright.config";

export default defineConfig({
  ...configBase,
  grep: /@ci/,
  forbidOnly: true,
  workers: 1,
  retries: 1,
  reporter: [
    ["dot"],
    [
      "html",
      {
        outputFolder: path.join(__dirname, "Evidencias/reportes-ci"),
        open: "never",
      },
    ],
  ],
  use: {
    ...configBase.use,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: configBase.projects?.filter(({ name }) => name === "Chromium"),
});
