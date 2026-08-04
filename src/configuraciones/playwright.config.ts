import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const VIEWPORT_ESTABLE = { width: 1280, height: 720 };

console.log('✅ Cargando configuración de Playwright desde Nueva configuración /src/configuraciones/playwright.config.ts');
export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  timeout: 400000,
  fullyParallel: true,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'Evidencias/reportes' }]],
  use: {
    baseURL: 'https://weeqp.azurewebsites.net/QP/WeeClaims',
    trace: 'retain-on-failure',  // guarda el trace solo si falla (para no ocupar tanto)
    screenshot: 'only-on-failure', // screenshot solo en fallos
    video: 'on', // 🔥 GUARDA SIEMPRE el video
    // trace: 'on-first-retry',
    // screenshot: 'only-on-failure',
    // video: 'retain-on-failure',

  },
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
        headless: false,
        viewport: VIEWPORT_ESTABLE,
      },
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        headless: false,
        viewport: VIEWPORT_ESTABLE,
      },
    },
  ],
});
