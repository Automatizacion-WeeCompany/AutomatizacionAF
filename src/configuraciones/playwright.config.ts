import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { registrarInfo } from '../utilidades/LoggerPruebas';

const VIEWPORT_ESTABLE = { width: 1280, height: 720 };
const isCI = Boolean(process.env.CI);

registrarInfo('✅ Cargando configuración de Playwright desde Nueva configuración /src/configuraciones/playwright.config.ts');
export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  timeout: 400000,
  fullyParallel: true,
  workers: isCI ? 1 : undefined,
  retries: isCI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', {
      outputFolder: path.join(__dirname, '../../playwright-report'),
      open: 'never',
    }],
  ],
  use: {
    baseURL: 'https://weeqp.azurewebsites.net/QP/WeeClaims',
    headless: isCI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
        viewport: VIEWPORT_ESTABLE,
      },
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        viewport: VIEWPORT_ESTABLE,
      },
    },
  ],
});
