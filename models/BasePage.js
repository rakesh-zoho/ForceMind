import { expect } from '@playwright/test';
import { navigateToApp, waitForSFLoad } from '../utils/sf-helpers.js';
import { fillField as utilFillField, selectPicklist as utilSelectPicklist, fillLookup as utilFillLookup } from '../utils/locator-utils.js';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateToApp(appName) {
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape').catch(() => null);
      await this.page.waitForTimeout(1000);
    }
    await navigateToApp(this.page, appName);
  }

  async waitForSFLoad() {
    await waitForSFLoad(this.page);
  }

  async clickButton(name) {
    await this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }).click();
    await this.waitForSFLoad();
  }

  async fillField(label, value) {
    await utilFillField(this.page, label, value);
  }

  async selectPicklist(label, value) {
    await utilSelectPicklist(this.page, label, value);
  }

  async fillLookup(label, value) {
    await utilFillLookup(this.page, label, value);
  }

  async assertSuccessToast(expectedText) {
    const toast = this.page.locator('.toastMessage');
    await toast.waitFor({ state: 'visible', timeout: 15000 });
    if (expectedText) {
      await expect(toast).toContainText(expectedText);
    }
    return toast;
  }

  async getDatePlusDays(days = 30) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  async uniqueName(prefix = 'Agentic Test') {
    return `${prefix}-${Date.now()}`;
  }
}
