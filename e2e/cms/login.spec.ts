import { test, expect } from '@playwright/test';

test.describe('CMS Login Microsite Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login'); 
  });

  test('As admin can login with credential valid', async ({ page }) => {
    // Gunakan test.step untuk membungkus langkah-langkahnya
    await test.step('Fill in the login form with valid credentials', async () => {
      await page.fill('#username', process.env.CMS_EMAIL!);
      await page.fill('#password', process.env.CMS_PASSWORD!);
      await page.click('button[type="submit"]');
    });  

    await test.step('Verify successful login redirect', async () => {
      await expect(page).toHaveURL(/.*events/); 
    });
  });
});