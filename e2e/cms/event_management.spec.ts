import { test, expect, Page } from '@playwright/test';
import path from 'path';

const cmsEmail = process.env.CMS_EMAIL;
const cmsPassword = process.env.CMS_PASSWORD;

async function navigateToRepresentative(page: Page) {
  await page.waitForSelector('nav, aside, .sidebar', { timeout: 15000 });

  const settingsMenu = page.getByText(/Event Management/i).first();
  await settingsMenu.scrollIntoViewIfNeeded();
  await settingsMenu.click();

  const submenu = page.getByText(/Event Management/i).first();
  await submenu.waitFor({ state: 'visible' });
  await submenu.click();
  
  await page.waitForURL(/.*events/i);
  
  await page.waitForSelector('.v-table-tbody', { timeout: 15000 });
  console.log('✅ Berhasil masuk ke menu Even Management.');
}

test.describe('Event Management', () => {
  
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
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('UAT - Absensi & Registrasi Dev');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);

    await expect(firstRowAfter).toContainText('UAT - Absensi & Registrasi Dev');
  });

  test('as a admin can create new data event management', async ({ page }) => {
    await navigateToRepresentative(page);
    console.log('🖱️ Klik Add Event...');
    const addEventBtn = page.locator('a:has-text("Add Event")');
    await addEventBtn.waitFor({ state: 'visible' });
    await addEventBtn.click();

    await page.waitForURL('**/create');

    const inventoriDropdown = page.locator('.v-select-selected', { hasText: 'Select Initiator' });
    await inventoriDropdown.click();
  
    const inventoriOption = page.getByRole('option', { name: 'EMPAT', exact: true });
    await inventoriOption.waitFor({ state: 'visible', timeout: 5000 });
    await inventoriOption.click();

    const initiatorDropdown = page.locator('.v-select-selected', { hasText: 'Select Sub Initiator' });
    await initiatorDropdown.click();

    const initiatorOption = page.getByRole('option', { name: 'Sub 4', exact: true });
    await initiatorOption.waitFor({ state: 'visible' });
    await initiatorOption.click();
  
    const eventCategoryDropdown = page.locator('.v-select-selected', { hasText: 'Select Event Category' });
    await eventCategoryDropdown.click();

    const eventCategoryOption = page.getByRole('option', { name: 'Cat 4', exact: true });
    await eventCategoryOption.waitFor({ state: 'visible' });
    await eventCategoryOption.click();

    const switchShowEvent = page.locator('.v-switch-group', { hasText: 'Show Event' }).locator('button[role="switch"]');
    await switchShowEvent.waitFor({ state: 'visible' });
    await switchShowEvent.click();

   
    const switchReg = page.locator('.v-switch-group', { hasText: 'Registration Status' }).locator('button[role="switch"]');
    await switchReg.waitFor({ state: 'visible' });
    await switchReg.click();

    const fileInput = page.locator('input[type="file"]').first();
    const testFilePath = path.resolve(__dirname, '../../file/nutricia.jpg');
    await fileInput.setInputFiles(testFilePath);

    await page.locator('#event-name-input').fill('UAT Microsite');
    await page.locator('#event-description-textarea').last().fill('Descrpiton Event Automation Microsite by Quality Assurance');

    const switchPassword = page.locator('.v-switch-group', { hasText: 'Password' }).locator('button[role="switch"]');
    await switchPassword.waitFor({ state: 'visible' });
    await switchPassword.click();

    await page.locator('#password-input').fill('123Abcde');
    await page.locator('#survey-link-input').fill('https://google.com');

    console.log('⏳ Memilih Event Date...');

    const dateInput = page.locator('input[name="date"]'); 
    await dateInput.click();

    const nextMonthBtn = page.getByLabel('Next month');
    await nextMonthBtn.waitFor({ state: 'visible' });
    await nextMonthBtn.click();
    
    await page.waitForTimeout(500);

    const startDay = page.locator('.dp__cell_inner', { hasText: /^1$/ }).first();
    const endDay = page.locator('.dp__cell_inner', { hasText: /^29$/ }).first();

    await startDay.click();
    await endDay.click();

    await page.waitForTimeout(500); 

    const selectBtn = page.locator('button.dp__action_select');
    
    await selectBtn.click({ force: true });

    await expect(dateInput).not.toHaveValue('');

    await page.getByPlaceholder('HH:mm').click();

    const setTargetTime = async (type: 'hours' | 'minutes', index: number, target: string) => {
        const displayBtn = page.locator(`[data-test="${type}-toggle-overlay-btn-${index}"]`);
        const incBtn = page.locator(`[data-test="${type}-time-inc-btn-${index}"]`);
        const decBtn = page.locator(`[data-test="${type}-time-dec-btn-${index}"]`);
        
        const targetInt = parseInt(target);
        let currentText = await displayBtn.innerText();
        let currentInt = parseInt(currentText);
        let safetyBreak = 0; 
        
        while (currentInt !== targetInt && safetyBreak < 60) {
            if (targetInt > currentInt) {
                await incBtn.click();
            } else {
                await decBtn.click();
            }
            currentText = await displayBtn.innerText();
            currentInt = parseInt(currentText);
            safetyBreak++;
        }
    };

    await setTargetTime('hours', 0, '4');
    await setTargetTime('minutes', 0, '0');
    await setTargetTime('hours', 1, '23');
    await setTargetTime('minutes', 1, '0');

    const timePreview = page.locator('.dp__selection_preview');
    if (await timePreview.isVisible()) {
        await timePreview.click();
    }
    await page.waitForTimeout(300);


    const selectBtnJam = page.locator('button.dp__action_select').last();
    await selectBtnJam.click({ force: true });

    const timeInput = page.getByPlaceholder('HH:mm');
    await page.waitForTimeout(500); 
    
    let timeVal = await timeInput.inputValue();
    if (!timeVal || timeVal === "") {
        console.log('⚠️ Form jam masih kosong, mencoba force dengan Enter...');
        await timeInput.click(); 
        await page.keyboard.press('Enter');
        timeVal = await timeInput.inputValue();
    }

  const checkRegistrasi = page.locator('#registration-checkbox');
  await checkRegistrasi.waitFor({ state: 'attached' }); 
  await checkRegistrasi.check({ force: true });

  const checkAbsensi = page.locator('#attendance-checkbox');
  await checkAbsensi.waitFor({ state: 'attached' }); 
  await checkAbsensi.check({ force: true });

  const registrationSection = page.locator('div', { hasText: /^ Event Registration Date $/ }).first();

  await registrationSection.evaluate((el) => {
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await page.mouse.wheel(0, -100);

  await page.waitForTimeout(800);
  const registerDateInput = registrationSection.locator('input[name="date"]');
  await registerDateInput.click();

  await page.waitForTimeout(500);

  const hariIni = new Date();
  
  const besok = new Date(hariIni);
  besok.setDate(hariIni.getDate() + 1);
  const tglBesok = besok.getDate();

  const lusa = new Date(hariIni);
  lusa.setDate(hariIni.getDate() + 2);
  const tglLusa = lusa.getDate();

  const activePicker = page.locator('.dp--menu-wrapper');

  const getEnabledCell = (day: any) => {
    return activePicker
      .locator('.dp__cell_inner:not(.dp__cell_disabled):not(.dp__cell_out_of_range)')
      .filter({ hasText: new RegExp(`^${day}$`), visible: true })
      .first();
  };


  const startCell = getEnabledCell(tglBesok);
  await startCell.waitFor({ state: 'visible' });
  await startCell.evaluate((el) => (el as any).click()); 

  await page.waitForTimeout(500);


  const endDayCell = getEnabledCell(tglLusa);
  await endDayCell.waitFor({ state: 'visible' });
  await endDayCell.evaluate((el) => (el as any).click());


  const selectBtn1 = activePicker.locator('button[data-test="select-button"]');
  await expect(selectBtn1).toBeEnabled({ timeout: 5000 });
  await selectBtn1.click();

  await page.waitForTimeout(500);
  const valReg = await registerDateInput.inputValue();

 const absensiDateInput = page.locator('input[name="date"]').last();

  await absensiDateInput.evaluate((el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  await page.waitForTimeout(500);
  await absensiDateInput.click({ force: true });

  const activePickerAbsensi = page.locator('.dp--menu-wrapper');
  await activePickerAbsensi.waitFor({ state: 'visible', timeout: 5000 });

  console.log('➡️ Pindah ke bulan Maret...');
  await activePickerAbsensi.locator('button[aria-label="Next month"]').click();
  await page.waitForTimeout(500);

  console.log('📅 Memilih range tanggal...');
  const startDayAbsensi = activePickerAbsensi.locator('.dp__cell_inner', { hasText: /^1$/ }).filter({ visible: true }).first();
  const endDayAbsensi = activePickerAbsensi.locator('.dp__cell_inner', { hasText: /^29$/ }).filter({ visible: true }).first();

  await startDayAbsensi.click({ force: true });
  await page.waitForTimeout(300);
  await endDayAbsensi.click({ force: true });

  const selectBtnAbsensi = activePickerAbsensi.locator('button[data-test="select-button"]');
  await selectBtnAbsensi.click({ force: true });

  await page.waitForTimeout(1000);

  console.log('🔄 Memaksa sinkronisasi state ke form...');
  await absensiDateInput.evaluate((el) => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await absensiDateInput.focus();
  await page.keyboard.press('Enter');
  
  await page.waitForTimeout(500);

  let valAbsensi = await absensiDateInput.inputValue();
  console.log(`✅ Akhirnya terisi: ${valAbsensi}`);
  
  await expect(absensiDateInput).not.toHaveValue('', { timeout: 10000 });

  const multiselect = page.locator('div')
    .filter({ has: page.locator('p', { hasText: 'Audiences' }) })
    .locator('.multiselect')
    .first();

  await multiselect.scrollIntoViewIfNeeded();

  const optionsToSelect = ['KDM', 'Nurses'];

  for (const optionText of optionsToSelect) {
    const isExpanded = await multiselect.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await multiselect.click({ force: true });
      await page.waitForTimeout(300); 
    }

    console.log(`🖱️ Mencoba klik: ${optionText}`);
    
    const option = multiselect.locator('.multiselect__option').filter({ hasText: new RegExp(`^${optionText}$`) });
    
    await option.waitFor({ state: 'visible', timeout: 3000 });
    await option.click({ force: true });

    await page.waitForTimeout(500); 
  }

  await page.keyboard.press('Escape');

  const selectedTags = multiselect.locator('.multiselect__tag');
  const count = await selectedTags.count();
  console.log(`✅ Jumlah tag terpilih sekarang: ${count}`);

  for (const text of optionsToSelect) {
    await expect(multiselect).toContainText(text);
  }

  console.log('🔘 Memaksa klik radio Hybrid via Script...');

  const radioHybrid = page.locator('input[value="hybrid"]');

  await radioHybrid.evaluate(el => (el as any).click());

  await page.waitForTimeout(500);

  console.log(`✅ Status Hybrid: ${await radioHybrid.isChecked()}`);

  await page.locator('#offline-location-input').fill('Bandung automtion');
  await page.locator('#online-location-input').fill('https://google.com')

  console.log('🎨 Memilih Event Theme...');

  const themeMultiselect = page.locator('.multiselect').nth(1); 

  await themeMultiselect.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);

  await themeMultiselect.click({ force: true });

  const themeMenu = themeMultiselect.locator('.multiselect__content-wrapper');
  await themeMenu.waitFor({ state: 'visible', timeout: 5000 });

  const targetTheme = 'Alergi'; 
  const optionTheme = themeMenu.locator('.multiselect__option').filter({ hasText: new RegExp(`^${targetTheme}$`) });

  await optionTheme.click({ force: true });

  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('🍼 Memilih Product Name...');

  const productMultiselect = page.locator('.multiselect').nth(2); 

  await productMultiselect.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await productMultiselect.click({ force: true });

  const productMenu = productMultiselect.locator('.multiselect__content-wrapper');
  await productMenu.waitFor({ state: 'visible', timeout: 5000 });

  const productsToSelect = ['BEBELOVE 1', 'INFANTRINI'];

  for (const productName of productsToSelect) {
    console.log(`🖱️ Klik produk: ${productName}`);
    const option = productMenu.locator('.multiselect__option').filter({ hasText: new RegExp(`^${productName}$`) });
    await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });
    
    await page.waitForTimeout(400);
  }


  await page.keyboard.press('Escape');
  console.log('✅ Product Name berhasil dipilih dan dropdown ditutup.');

  
  await expect(productMultiselect).toContainText('BEBELOVE 1');

  console.log('📑 Mencari section Speaker...');

  const speakerHeader = page.getByText('Speaker', { exact: false }).first();
  await speakerHeader.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  console.log('📤 Mencoba upload file...');


  const speakerFileInput = page.locator('input[type="file"]').last();

  await speakerFileInput.waitFor({ state: 'attached', timeout: 10000 });

  const speakerPicPath = path.resolve(__dirname, '../../file/3.jpg');

  await speakerFileInput.setInputFiles(speakerPicPath);

  await speakerFileInput.focus();
  await speakerFileInput.dispatchEvent('change', { bubbles: true });
  
  console.log('✅ File speaker berhasil di-upload.');

  console.log('📝 Mengisi detail Speaker...');

  const speakerName = page.locator('#speaker-name-input-0'); 
  await speakerName.scrollIntoViewIfNeeded();
  await speakerName.fill('Dr. John Doe, Sp.A');

  const speakerTitle = page.locator('input[placeholder="Enter Speaker\'s Title"]');
  await speakerTitle.scrollIntoViewIfNeeded();
  await speakerTitle.fill('Spesialis Anak - RS Harapan Bangsa');

 console.log('🔘 Menyalakan semua Switch Button...');

  const switches = [
    'Add Field Instansi',
    'Add Field Profesi',
    'Add Field Puskesmas',
    'Add Field Jenis Puskesmas',
    'Add Field NIK Plataran Sehat',
    'Add Field Tanggal Lahir',
    'Add Field Reps Name'
  ];

  for (const labelText of switches) {
    const switchGroup = page.locator('.v-switch-group').filter({ hasText: labelText });
    const button = switchGroup.locator('button[role="switch"]');

    const isChecked = await button.getAttribute('aria-checked');

    if (isChecked === 'false') {
      console.log(`✅ Aktifkan: ${labelText}`);
      await button.click();
      await page.waitForTimeout(300); 
    } else {
      console.log(`ℹ️ ${labelText} sudah aktif.`);
    }
  }

  const breadcrumb = page.locator('a.breadcrumbs-item').filter({ hasText: 'Event Management' }).first();

  await breadcrumb.scrollIntoViewIfNeeded();
  
  await page.waitForTimeout(1000);

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
      console.log('✅ Success Create Data Event Management');
      await expect(page.locator('a:has-text("Add Event")')).toBeVisible({ timeout: 10000 });
  }
  
  });

  test('as a admin can search data by event name access detail event', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Event Automation Microsite');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);
    

    await expect(firstRowAfter).toContainText('Event Automation Microsite');

    const DetailEventBtn = page.locator('a:has-text("Detail")');
    await DetailEventBtn.waitFor({ state: 'visible' });
    await DetailEventBtn.click();

    await page.waitForLoadState('networkidle');

    const passwordBtn = page.getByTitle('Show password');
    await passwordBtn.click();
    console.log('👁️ Password ditampilkan!');

    const copyBtn = page.getByTitle('Copy password');
    if (await copyBtn.isVisible()) {
        await copyBtn.click();
        console.log('📋 Password disalin ke clipboard!');
    }
    await page.waitForTimeout(1000);


  });

  test('as a admin can search data by event name access edit event', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Event Automation Microsite');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);
    

    await expect(firstRowAfter).toContainText('Event Automation Microsite');

    const editEventBtn = page.locator('a:has-text("Edit")');
    await editEventBtn.waitFor({ state: 'visible' });
    await editEventBtn.click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const switchShowEvent = page.locator('.v-switch-group', { hasText: 'Show Event' }).locator('button[role="switch"]');
    await switchShowEvent.waitFor({ state: 'visible' });
    await switchShowEvent.click();

   
    const switchReg = page.locator('.v-switch-group', { hasText: 'Registration Status' }).locator('button[role="switch"]');
    await switchReg.waitFor({ state: 'visible' });
    await switchReg.click();

    const breadcrumb = page.locator('a.breadcrumbs-item').filter({ hasText: 'Event Management' }).first();

    await breadcrumb.scrollIntoViewIfNeeded();
    
    await page.waitForTimeout(1000);

    console.log('🚀 Menembak tombol Submit...');

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: 'Submit' }).first();

    await submitBtn.click({ force: true });
    
    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500); 
    const successBtn = page.locator('.swal2-confirm');
    if (await successBtn.isVisible({ timeout: 5000 })) {
        await successBtn.click();
        console.log('✅ Success Edit Data Event Management');
    }
  });

   test('as a admin can search data by event name access delete event', async ({ page }) => {
    await navigateToRepresentative(page);

    const firstRowBefore = page.locator('.v-table-tbody tr').first();
    await expect(firstRowBefore).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Event Automation Microsite');
    
    await searchInput.press('Enter');

    const firstRowAfter = page.locator('.v-table-tbody tr').first();

    const rowCount = await page.locator('.v-table-tbody tr').count();
    console.log(`✅ Berhasil search. Menemukan ${rowCount} data.`);
    

    await expect(firstRowAfter).toContainText('Event Automation Microsite');

    await page.waitForTimeout(1000);

    const deleteBtn = page.locator('button').filter({ hasText: /^Delete$/ }).first();

    await deleteBtn.waitFor({ state: 'attached', timeout: 10000 });

    await deleteBtn.scrollIntoViewIfNeeded();

    console.log('🚀 Klik tombol Delete...');
    await deleteBtn.click({ force: true });

    console.log('🔔 Handling SweetAlert Pop-ups...');
    
    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500); 
    const successBtn = page.locator('.swal2-confirm');
    if (await successBtn.isVisible({ timeout: 5000 })) {
        await successBtn.click();
        console.log('✅ Success Delete Data Event Management');
    }

  });

});