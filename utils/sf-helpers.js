import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import 'dotenv/config';

const authStatePath = './reports/.auth-state.json';

async function performLogin() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('\n SF Global Setup: Logging into Salesforce...');

  try {
    await page.goto(`${process.env.SF_URL}/lightning/page/home`, {
      waitUntil: 'domcontentloaded',
    });

    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    await page.click('#Login');

    await page.waitForSelector(
      '[data-id="AppNavigation"], .navContainer, one-app-nav-bar',
      { timeout: 60000 }
    );

    const storageState = await page.context().storageState();
    writeFileSync(authStatePath, JSON.stringify(storageState, null, 2));
    console.log(' Auth state saved to reports/.auth-state.json\n');
  } catch (err) {
    console.error(' SF Login failed:', err.message);
    mkdirSync('./reports', { recursive: true });
    await page.screenshot({ path: './reports/login-failure.png' });
    throw err;
  } finally {
    await browser.close();
  }
}

async function globalSetup() {
  mkdirSync(dirname(authStatePath), { recursive: true });
  console.log(' Refreshing Salesforce auth state for this test run...');
  await performLogin();
}

export default globalSetup;

export async function waitForSFLoad(page, timeout = 30000) {
  try {
    await page.waitForFunction(
      () => {
        const hidden = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return true;
          const style = window.getComputedStyle(element);
          return (
            element.hidden ||
            element.getAttribute('aria-hidden') === 'true' ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            element.offsetParent === null
          );
        };

        return (
          hidden('.forceListViewManagerSpinner') &&
          hidden('.slds-spinner_container') &&
          hidden('.loadingIndicator') &&
          document.readyState === 'complete'
        );
      },
      { timeout }
    );
  } catch {
    // Timeout is non-critical — SF may not have spinners
  }
}

export async function switchToAllRecords(page, objectName) {
  try {
    const viewSwitcher = page.getByRole('button', { name: /Select a List View/i });
    if (await viewSwitcher.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewSwitcher.click();
      const allOption = page.getByRole('option', { name: `All Open ${objectName}s` }).first();
      if (await allOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await allOption.click();
      } else {
        const anyAllOption = page.getByRole('option', { name: /All/i }).first();
        if (await anyAllOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await anyAllOption.click();
        }
      }
      await waitForSFLoad(page);
    }
  } catch {
    // Already on correct list view
  }
}

export async function navigateToApp(page, appName) {
  let appLauncherButton = page.locator('[title="App Launcher"]').first();
  if ((await appLauncherButton.count()) === 0) {
    appLauncherButton = page.getByRole('button', { name: /App Launcher/i }).first();
  }
  await appLauncherButton.click({ timeout: 10000 });
  await page.waitForTimeout(2000);

  const appSearchInput = page.locator('input[placeholder*="search apps" i], input[placeholder*="Search apps" i]').first();
  await appSearchInput.waitFor({ state: 'visible', timeout: 10000 });
  await appSearchInput.fill(appName);
  await page.waitForTimeout(500);

  const appOption = page.getByRole('option', { name: new RegExp(`^${appName}$`, 'i') }).first();
  await appOption.waitFor({ state: 'visible', timeout: 10000 });
  await appOption.click({ timeout: 10000 });
  await waitForSFLoad(page);
  await page.waitForTimeout(1000);
}
