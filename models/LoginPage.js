import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#Login');
  }

  async login(username, password) {
    await this.page.goto(process.env.SF_URL);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForSelector(
      '[data-id="AppNavigation"], .navContainer, one-app-nav-bar',
      { timeout: 60000 }
    );
  }
}
