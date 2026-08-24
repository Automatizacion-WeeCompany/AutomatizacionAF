import { defineConfig } from "@playwright/test";
import path from "node:path";
import configBase from "./src/configuraciones/playwright.config";

const perfil = process.env.CI_PROFILE ?? "smoke";
const slotNightly = process.env.CI_NIGHTLY_SLOT;
if (perfil === "nightly" && !/^[1-4]$/.test(slotNightly ?? "")) {
  throw new Error(
    "CI_NIGHTLY_SLOT es obligatorio para el perfil nightly y debe ser 1, 2, 3 o 4.",
  );
}
const perfiles: Record<string, RegExp> = {
  smoke: /@smoke/,
  nightly: new RegExp(`@nightly-${slotNightly}(?:\\b|$)`),
  critical: /@nightly-[1-4]/,
  integration: /@integracion-ci/,
  tarifas: /@tarifa-ci/,
};
const grep = perfiles[perfil];
if (!grep) {
  throw new Error(
    `CI_PROFILE no soportado: ${perfil}. Use smoke, nightly, critical, integration o tarifas.`,
  );
}

const navegadorSolicitado = process.env.CI_BROWSER ?? "Chromium";
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
  grep,
  outputDir: path.join(__dirname, `test-results/${perfil}`),
  forbidOnly: true,
  fullyParallel: false,
  workers: 1,
  maxFailures: perfil === "critical" ? 2 : 1,
  reporter: [
    ["dot"],
    [
      "html",
      {
        outputFolder: path.join(
          __dirname,
          `Evidencias/reportes-ci/${perfil}`,
        ),
        open: "never",
      },
    ],
  ],
  use: {
    ...configBase.use,
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: proyectos,
});
