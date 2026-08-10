import { BasePage } from './BasePage.js';

export class AssetPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
    
    // Locators for Asset object
    this.assetNameInput = page.getByLabel('Asset Name');
    this.productInput = page.getByLabel('Product');
    this.serialNumberInput = page.getByLabel('Serial Number');
    this.statusSelect = page.getByLabel('Status');
    this.installDateInput = page.getByLabel('Install Date');
    this.purchaseDateInput = page.getByLabel('Purchase Date');
    this.priceInput = page.getByLabel('Price');
    this.descriptionInput = page.getByLabel('Description');
  }

  async navigate() {
    await this.page.goto('/lightning/o/Asset/home');
    await this.waitForSFLoad();
  }

  async clickNew() {
    await this.page.getByRole('button', { name: 'New' }).click();
    await this.waitForTimeout(1000);
  }

  async fillRequiredFields(data) {
    if (data.name) {
      await this.assetNameInput.fill(data.name);
    }
    if (data.product) {
      await this.productInput.fill(data.product);
    }
    if (data.serialNumber) {
      await this.serialNumberInput.fill(data.serialNumber);
    }
    if (data.status) {
      await this.statusSelect.click();
      await this.page.getByRole('option', { name: data.status }).click();
    }
  }

  async fillBoundaryFields(data) {
    await this.fillRequiredFields(data);
    
    if (data.installDate) {
      await this.installDateInput.fill(data.installDate);
    }
    if (data.purchaseDate) {
      await this.purchaseDateInput.fill(data.purchaseDate);
    }
    if (data.price) {
      await this.priceInput.fill(data.price.toString());
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async getErrorMessage() {
    return this.page.locator('.toastMessage').textContent();
  }

  async isFormOpen() {
    return await this.page.locator('lightning-modal').isVisible();
  }
}