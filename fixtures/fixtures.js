import path from 'path';
import { test as base } from '@playwright/test';
import { waitForSFLoad } from '../utils/sf-helpers.js';
import { LeadPage } from '../models/LeadPage.js';
import { OpportunityPage } from '../models/OpportunityPage.js';
import { AccountPage } from '../models/AccountPage.js';
import { ContactPage } from '../models/ContactPage.js';
import { CasePage } from '../models/CasePage.js';
import { AppLauncherPage } from '../models/AppLauncherPage.js';
import { startScreencast, stopScreencast } from '../utils/reporter-utils.js';

const authStatePath = path.resolve(process.cwd(), 'reports/.auth-state.json');

export const sfTest = base.extend({
  sfPage: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: authStatePath,
      permissions: [],
    });

    const page = await context.newPage();

    try {
      // Start screencast for video recording
      await startScreencast(page, testInfo);
      
      const lightningHome = new URL('/lightning/page/home', process.env.SF_URL).toString();
      await page.goto(lightningHome, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await waitForSFLoad(page);

      const appLauncher = page.locator('[title="App Launcher"]').first();
      await appLauncher.waitFor({ state: 'visible', timeout: 25000 });
      await page.waitForTimeout(1000);

      await use(page);
    } finally {
      // Stop screencast and attach video to report
      await stopScreencast(page, testInfo, true);
      await context.close();
    }
  },

  leadPage: async ({ sfPage }, use) => {
    await use(new LeadPage(sfPage));
  },

  opportunityPage: async ({ sfPage }, use) => {
    await use(new OpportunityPage(sfPage));
  },

  accountPage: async ({ sfPage }, use) => {
    await use(new AccountPage(sfPage));
  },

  contactPage: async ({ sfPage }, use) => {
    await use(new ContactPage(sfPage));
  },

  casePage: async ({ sfPage }, use) => {
    await use(new CasePage(sfPage));
  },

  appLauncher: async ({ sfPage }, use) => {
    await use(new AppLauncherPage(sfPage));
  },
});

export { expect } from '@playwright/test';
