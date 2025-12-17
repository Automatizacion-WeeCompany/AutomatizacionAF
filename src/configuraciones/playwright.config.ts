import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

console.log('✅ Cargando configuración de Playwright desde /src/configuraciones/playwright.config.ts');
export default defineConfig({
  testDir: path.join(__dirname, '../tests'),
  timeout: 150000,
  fullyParallel: true,
  workers: 9,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'Evidencias/reportes' }]],
  use: {
    baseURL: 'https://weeqp.azurewebsites.net/QP/WeeClaims',
    trace: 'retain-on-failure',  // guarda el trace solo si falla (para no ocupar tanto)
    screenshot: 'only-on-failure', // screenshot solo en fallos
    video: 'on', // 🔥 GUARDA SIEMPRE el video
    // trace: 'on-first-retry',
    // screenshot: 'only-on-failure',
    // video: 'retain-on-failure',
    headless: false,
  },
  projects: [
    {
      name: 'Chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
});