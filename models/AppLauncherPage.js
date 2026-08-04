import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class AppLauncherPage extends BasePage {
  constructor(page) {
    super(page);
    this.appLauncherButton = page.locator('[title="App Launcher"]').first();
    this.searchBox = page.getByPlaceholder(/search apps and items...|search/i).first();
  }

  async open() {
    if ((await this.appLauncherButton.count()) === 0) {
      this.appLauncherButton = this.page.getByRole('button', { name: /App Launcher/i }).first();
    }
    await this.appLauncherButton.click({ timeout: 10000 });
    await this.waitForSFLoad();
  }

  async searchAndOpenApp(appName) {
    await this.open();
    await this.searchBox.fill(appName, { timeout: 5000 });
    await this.page.waitForTimeout(500);
    const appOption = this.page.getByRole('option', { name: new RegExp(`^${appName}$`, 'i') }).first();
    await appOption.click({ timeout: 10000 });
    await this.waitForSFLoad();
  }
}
