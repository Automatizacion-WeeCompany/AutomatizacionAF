import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { registrarInfo } from '../utilidades/LoggerPruebas';

const VIEWPORT_ESTABLE = { width: 1280, height: 720 };
const isCI = Boolean(process.env.CI);
const CI_WORKERS_PREDETERMINADOS = 3;
const MAX_CI_WORKERS = 4;
const parsedWorkers = Number.parseInt(
  process.env.CI_WORKERS ?? String(CI_WORKERS_PREDETERMINADOS),
  10,
);
const ciWorkers =
  Number.isInteger(parsedWorkers) && parsedWorkers > 0
    ? Math.min(parsedWorkers, MAX_CI_WORKERS)
    : CI_WORKERS_PREDETERMINADOS;

registrarInfo('✅ Cargando configuración de Playwright desde Nueva configuración /src/configuraciones/playwright.config.ts');
registrarInfo(
  `Entorno Playwright: CI=${isCI}, headless=${isCI}, workers=${isCI ? ciWorkers : 'auto'}, fullyParallel=false`,
);
export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  timeout: 180_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: isCI ? ciWorkers : undefined,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [
        ['dot'],
        ['html', {
          outputFolder: path.join(__dirname, '../../playwright-report'),
          open: 'never',
        }],
      ]
    : [
        ['list'],
        ['html', {
          outputFolder: path.join(__dirname, '../../playwright-report'),
          open: 'never',
        }],
      ],
  use: {
    baseURL: 'https://weeqp.azurewebsites.net/QP/WeeClaims',
    headless: isCI,
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
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
