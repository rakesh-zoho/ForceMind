import { test, expect } from '@playwright/test';
import fs from 'fs';
import { waitForSFLoad } from '../utils/sf-helpers.js';

test.skip(!fs.existsSync('./reports/.auth-state.json'), 'Auth state missing — run globalSetup first');

test.use({ storageState: './reports/.auth-state.json' });

test('seed: Salesforce login and Lightning shell loads', async ({ page }) => {
  await page.goto(process.env.SF_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await waitForSFLoad(page);
  await page.waitForTimeout(2000);

  const url = page.url();
  const isSalesforce =
    url.includes('force.com') ||
    url.includes('salesforce.com') ||
    url.includes('localhost') ||
    url.includes('127.0.0.1');

  const isNotOnLogin = !url.includes('/login');

  expect(isSalesforce).toBeTruthy();
  expect(isNotOnLogin).toBeTruthy();
});
