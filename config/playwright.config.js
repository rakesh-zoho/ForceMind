import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const authStatePath = './reports/.auth-state.json';

export default defineConfig({
  testDir: '../tests',
  outputDir: './reports/test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: parseInt(process.env.TIMEOUT) || 80000,
  expect: { timeout: 15000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/playwright-report', open: 'never' }],
    ['junit', { outputFile: './reports/junit-results.xml' }],
    ['allure-playwright', {
      resultsDir: './reports/allure-results',
      detail: true,
      suiteTitle: true,
    }],
    ['../reporters/jira-reporter.js', {}],
    ['../reporters/teams-reporter.js', {}],
  ],

  launchOptions: {
    args: [
      '--disable-gpu',
      '--use-gl=swiftshader',
      '--disable-dev-shm-usage',
    ],
  },

  use: {
    baseURL: process.env.BASE_URL || process.env.SF_URL,
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    navigationTimeout: 60000,
    actionTimeout: 30000,
    permissions: [],
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: '../utils/sf-helpers.js',
});
