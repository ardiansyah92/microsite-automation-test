import { test, expect, Page } from '@playwright/test';
import path from 'path';

const cmsEmail = process.env.CMS_EMAIL;
const cmsPassword = process.env.CMS_PASSWORD;

async function navigateToSurvey(page: Page) {
  await page.waitForSelector('nav, aside, .sidebar', { timeout: 15000 });

  const settingsMenu = page.getByText(/Settings/i).first();
  await settingsMenu.scrollIntoViewIfNeeded();
  await settingsMenu.click();
  
  const submenu = page.getByText(/Survey Management/i).first();
  await submenu.waitFor({ state: 'visible' });
  await submenu.click();
 
  await page.waitForURL(/.*surveys/i);
  
  await page.waitForSelector('.v-table-tbody', { timeout: 15000 });
  console.log('✅ Berhasil masuk ke menu Survey Management.');
}

test.describe('Survey', () => {
  
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

  test('as a admin can search data by event name', async ({ page }) => {
    await navigateToSurvey(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('UAT - Review');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('UAT - Review');
  });

  test('as a admin can create new data survey', async ({ page }) => {
    await navigateToSurvey(page);
    await page.waitForLoadState('networkidle');
    const addSurveyBtn = page.locator('button, a').filter({ hasText: /Add Survey/i }).first();
    await addSurveyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addSurveyBtn.click({ force: true });

    await page.waitForURL('**/create');

    const surveyTypeDropdown = page.locator('.v-select-selected', { hasText: 'Select Survey Type' });
    await surveyTypeDropdown.click();
  
    const surveyOption = page.getByRole('option', { name: 'Both', exact: true });
    await surveyOption.waitFor({ state: 'visible', timeout: 5000 });
    await surveyOption.click();

    const eventTypeDropdown = page.locator('.v-select-selected', { hasText: 'Select Event Type' });
    await eventTypeDropdown.click();

    const eventTypeOption = page.getByRole('option', { name: 'Both', exact: true });
    await eventTypeOption.waitFor({ state: 'visible' });
    await eventTypeOption.click();
  
    const dropdownTrigger = page.locator('.v-select-selected', { hasText: 'Select Event' });
    await dropdownTrigger.click();

    const searchInput = page.locator('.v-select-options input.v-input-control');
    await searchInput.waitFor({ state: 'visible' });

    const targetEvent = "Event Automation Microsite 2";
    await searchInput.fill(targetEvent);
    await page.waitForTimeout(500);

    const option = page.locator('.v-select-option-text', { hasText: targetEvent }).first();
    await option.click({ force: true });

    const surveyCategoryTypeDropdown = page.locator('.v-select-selected', { hasText: 'Select Survey Category' });
    await surveyCategoryTypeDropdown.click();

    const surveyTypeOption = page.getByRole('option', { name: 'Both', exact: true });
    await surveyTypeOption.waitFor({ state: 'visible' });
    await surveyTypeOption.click();

    await page.locator('#survey-title-input').last().fill('Survey automation');
    await page.locator('#survey-description-input').last().fill('Description survey automation');

    const switchactive = page.locator('.v-switch-group', { hasText: 'Is Active' }).locator('button[role="switch"]');
    await switchactive.waitFor({ state: 'visible' });
    await switchactive.click();

    const questionBtn = page.locator('button, a').filter({ hasText: / Add Question /i }).first();
    await questionBtn.waitFor({ state: 'visible', timeout: 10000 });
    await questionBtn.click({ force: true });

    const Question1Dropdown = page.locator('.v-select-selected', { hasText: 'Select Question Type' });
    await Question1Dropdown.click();

    const questionTypeOption = page.getByRole('option', { name: 'Multiple Choice', exact: true });
    await questionTypeOption.waitFor({ state: 'visible', timeout: 5000 });
    await questionTypeOption.scrollIntoViewIfNeeded();
    await questionTypeOption.click();

    const switchmandatory = page.locator('.v-switch-group', { hasText: 'Is Mandatory' }).locator('button[role="switch"]');
    await switchmandatory.waitFor({ state: 'visible' });
    await switchmandatory.click();

    const questionTextarea = page.locator('textarea[placeholder="Question"]').first();
    await questionTextarea.waitFor({ state: 'visible' });
    await questionTextarea.fill('Automation website apakah sangat membantu?');
    
    const allOptions = ['Sangat', 'Bagus', 'Mudah', 'Cepat', 'Mempersingkat', 'Waktu', 'Bekerja', 'Saya'];
    const existingInputs = page.locator('textarea[placeholder="Enter option"]');
    
    await existingInputs.nth(0).fill(allOptions[0]);
    await existingInputs.nth(1).fill(allOptions[1]);

    const addOptionBtn = page.locator('button').filter({ hasText: 'Add Option' });

    for (let i = 2; i < allOptions.length; i++) {
        await addOptionBtn.click();
        
        const newEntry = page.locator('textarea[placeholder="Enter option"]').last();
        await newEntry.waitFor({ state: 'visible' });
        await newEntry.fill(allOptions[i]);
        
        await page.waitForTimeout(200);
    }

    const breadcrumb = page.locator('a.breadcrumbs-item').filter({ hasText: 'Survey Management' }).first();

    await breadcrumb.scrollIntoViewIfNeeded();
    
    await page.waitForTimeout(1000);

    console.log('🚀 Menembak tombol Submit...');

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: 'Submit' }).first();

    await submitBtn.click({ force: true });

    console.log('🔔 Handling SweetAlert Pop-ups...');
    
    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500); 
    const successBtn = page.locator('.swal2-confirm');
    if (await successBtn.isVisible({ timeout: 5000 })) {
        await successBtn.click();
        console.log('✅ Success Create Data Survey');
    }
  
  });


test('as a admin can edit data survey', async ({ page }) => {
    await navigateToSurvey(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('UAT - Review');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('UAT - Review');

    
    const editSurveyBtn = page.locator('button, a').filter({ hasText: /Edit/i }).first();
    await editSurveyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editSurveyBtn.click({ force: true });

    await page.waitForLoadState('networkidle');

    await page.locator('#survey-title-input').last().fill('UAT - Review Edit');
    await page.locator('#survey-description-input').last().fill('UAT - Review Edit');

    const switchactive = page.locator('.v-switch-group', { hasText: 'Is Active' }).locator('button[role="switch"]');
    await switchactive.waitFor({ state: 'visible' });
    await switchactive.click();

    const breadcrumb = page.locator('a.breadcrumbs-item').filter({ hasText: 'Survey Management' }).first();

    await breadcrumb.scrollIntoViewIfNeeded();
    
    await page.waitForTimeout(1000);

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: 'Submit' }).first();

    await submitBtn.click({ force: true });

    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500); 
    const successBtn = page.locator('.swal2-confirm');
    if (await successBtn.isVisible({ timeout: 5000 })) {
        await successBtn.click();
        console.log('✅ Success Edit Data Survey');
    }

  });

  test('as a admin can delete data survey', async ({ page }) => {
    await navigateToSurvey(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Event Automation Microsite 2');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('Event Automation Microsite 2');

    
    const editSurveyBtn = page.locator('button, a').filter({ hasText: /Delete/i }).first();
    await editSurveyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editSurveyBtn.click({ force: true });

    console.log('🔔 Handling SweetAlert Pop-ups...');
    
    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500); 
    const successBtn = page.locator('.swal2-confirm');
    if (await successBtn.isVisible({ timeout: 5000 })) {
        await successBtn.click();
        console.log('✅ Success Delete Data Survey');
    }

  });


  test('as a admin can get data report survey', async ({ page }) => {
    await navigateToSurvey(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Event Automation Microsite 1');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('Event Automation Microsite 1');

    
    const reportSurveyBtn = page.locator('button, a').filter({ hasText: /Report/i }).first();
    await reportSurveyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await reportSurveyBtn.click({ force: true });

    const firstreportRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstreportRowBefore).toBeVisible();

    const searchreportInput = page.locator('input[placeholder="Search"]');
    await searchreportInput.fill('Qualityassurance01');
    
    await searchreportInput.press('Enter');

    const detailBtn = page.locator('button, a').filter({ hasText: /Detail/i }).first();
    await detailBtn.waitFor({ state: 'visible', timeout: 10000 });
    await detailBtn.click({ force: true });

    const breadcrumb = page.locator('a.breadcrumbs-item').filter({ hasText: 'Survey Report' }).first();
    await breadcrumb.click()

    const downloadxlsBtn = page.locator('button, a').filter({ hasText: /Download XLS/i }).first();
    await downloadxlsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await downloadxlsBtn.click({ force: true });
    console.log('✅ Success Get data Report Survey and Download Data Survey');

  });

});