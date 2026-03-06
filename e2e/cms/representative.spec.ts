import { test, expect, Page } from '@playwright/test';
import path from 'path';

const cmsEmail = process.env.CMS_EMAIL;
const cmsPassword = process.env.CMS_PASSWORD;

async function navigateToRepresentative(page: Page) {
  await page.waitForSelector('nav, aside, .sidebar', { timeout: 15000 });

  const settingsMenu = page.getByText(/Master Data/i).first();
  await settingsMenu.scrollIntoViewIfNeeded();
  await settingsMenu.click();
  
  const submenu = page.getByText(/Representative/i).first();
  await submenu.waitFor({ state: 'visible' });
  await submenu.click();
 
  await page.waitForURL(/.*representative/i);
  
  await page.waitForSelector('.v-table-tbody', { timeout: 15000 });
  console.log('✅ Berhasil masuk ke menu Representative.');
}

test.describe('Representative Master Data', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    
    await page.goto('/auth/login');

    await page.fill('#username', cmsEmail || '');
    await page.fill('#password', cmsPassword || '');

    await Promise.all([
      page.waitForURL(url => url.pathname.includes('/event')),
      page.click('button[type="submit"]')
    ]);
  });

  test('as a admin can search data by name', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Sintia');
 
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('Sintia');
  });

  test('as a admin can create new data Representative', async ({ page }) => {
    await navigateToRepresentative(page);

    await page.locator('button:has-text("Add Representative")').click();

    await page.locator('#representatives-name-input').fill('Sundy');

    console.log('⏳ Memilih Provinsi...');

    const provinceDropdown = page.locator('.v-select-selected', { hasText: 'Select Province' });
    await provinceDropdown.click();

    const provinceOption = page.getByRole('option', { name: 'Jawa Barat', exact: true });
    await provinceOption.waitFor({ state: 'visible', timeout: 5000 });
    await provinceOption.click();
 
    const districtDropdown = page.locator('.v-select-selected', { hasText: 'Select District' });
    await districtDropdown.click();

    const districtOption = page.getByRole('option', { name: 'Kota Bandung', exact: true });
    await districtOption.waitFor({ state: 'visible' });
    await districtOption.click();

    await page.locator('#representatives-region-code-input').fill('REG-001');
    await page.locator('#representatives-district-code-input').fill('DIS-001');

    const confirmBtn = page.locator('button:has-text("Confirm")');
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();

    const yesButton = page.getByRole('button', { name: /Yes/i });
    await yesButton.click();

    const okButton = page.getByRole('button', { name: /OK/i });
    await okButton.click();

    await expect(page.locator('.v-table-tbody')).toContainText('Sundy');
    console.log('✅ Success Create Data Representative');
  });

  test('as a admin can edit Representative', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Sundy');

    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('Sundy');

    const editButton = firstRowAfter.locator('button:has-text("Edit")');
    await editButton.click();

    await page.locator('#representatives-name-input').fill('Sundy Edit');

    console.log('⏳ Memilih Provinsi...');

    const provinceDropdown = page.locator('.v-select-selected', { hasText: 'Select Province' });
    await provinceDropdown.click();

    const provinceOption = page.getByRole('option', { name: 'Jawa Tengah', exact: true });
    await provinceOption.waitFor({ state: 'visible', timeout: 5000 });
    await provinceOption.click();

    await page.waitForTimeout(2000); 
    
    const districtDropdown = page.locator('.v-select-selected', { hasText: 'Select District' });
    await districtDropdown.click();

    const districtOption = page.getByRole('option', { name: 'Kota Surakarta', exact: true });
    await districtOption.waitFor({ state: 'visible' });
    await districtOption.click();

    await page.locator('#representatives-region-code-input').fill('REG-001');
    await page.locator('#representatives-district-code-input').fill('DIS-001');

    const confirmBtn = page.locator('button:has-text("Confirm")');
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();

    const yesButton = page.getByRole('button', { name: /Yes/i });
    await yesButton.click();

    const okButton = page.getByRole('button', { name: /OK/i });
    await okButton.click();

    await expect(page.locator('.v-table-tbody')).toContainText('Sundy Edit');
    console.log('✅ Success Edit Data Representative');

  });

  test('as a admin can delete data Representative', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Sundy');

    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();
    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);
    
    await expect(firstRowAfter).toContainText('Sundy');

    const deleteButton = firstRowAfter.locator('button:has-text("Delete")');
    await deleteButton.click();
    
    const yesButton = page.getByRole('button', { name: /Yes/i });
    await yesButton.click();

    const okButton = page.getByRole('button', { name: /OK/i });
    await okButton.click();

    await expect(page.locator('.v-table-tbody')).not.toContainText('Sundy');
    console.log('✅ Success Delete Data Representative');

  });

  test('as a admin can upload bulk data Representative', async ({ page }) => {
    await navigateToRepresentative(page);

    const uploadButton = page.locator('button:has-text("Import")');
    await uploadButton.click();

    const fileInput = page.locator('input[type="file"]');
    const testFilePath = path.resolve(__dirname, '../../file/Template_Bulk_Reps.xlsx');
    await fileInput.setInputFiles(testFilePath);
    
    const confirmBtn = page.locator('button:has-text("Confirm")');
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    
    const yesButton = page.getByRole('button', { name: /Yes/i });
    await yesButton.click();

    const okButton = page.getByRole('button', { name: /OK/i });
    await okButton.click();

    await expect(page.locator('.v-table-tbody')).not.toContainText('Sundy');
    console.log('✅ Success Upload Data Representative');

  });



});