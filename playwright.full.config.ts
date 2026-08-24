import { defineConfig } from "@playwright/test";
import configBase from "./src/configuraciones/playwright.config";

const navegadorSolicitado = process.env.CI_BROWSER ?? "all";
const proyectos = configBase.projects?.filter(
  ({ name }) => navegadorSolicitado === "all" || name === navegadorSolicitado,
);
if (!proyectos?.length) {
  throw new Error(
    `CI_BROWSER no soportado: ${navegadorSolicitado}. Use Chromium, Firefox o all.`,
  );
}

export default defineConfig({
  ...configBase,
  forbidOnly: true,
  fullyParallel: false,
  workers: 3,
  reporter: [["blob", { outputDir: "blob-report" }]],
  use: {
    ...configBase.use,
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: proyectos,
});
