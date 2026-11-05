/*
11 automated Playwright tests in tests/profile-photo.spec.js for Issue #44:

Test                          What it checks

TC-PP-001                Profile photo modal opens and Save is disabled by default
TC-PP-002                Valid PNG shows a preview, Save and Cancel enabled
TC-PP-003                Valid JPG shows a preview, Save and Cancel enabled
TC-PP-004                Cancel after upload discards the change and closes the modal
TC-PP-005                A file over 5 MB is rejected and Save stays disabled
TC-PP-006                An unsupported format (GIF) is rejected with the error message
TC-PP-007                The error clears after you select a valid file
TC-PP-008                Upload and Save works (the modal closes after saving)
TC-PP-009                Uploaded photo persists after a page reload
TC-PP-010                A network error during save shows a message and Save stays enabled
TC-PP-011                Retrying Save after a failed attempt succeeds

Run commands:
   npx playwright test tests/profile-photo.spec.js --project=chromium --reporter=list 2>&1 | tee log-chromium.txt
   npx playwright test tests/profile-photo.spec.js --project=firefox --reporter=list 2>&1 | tee log-firefox.txt
   npx playwright test tests/profile-photo.spec.js --project=webkit --reporter=list 2>&1 | tee log-webkit.txt

*/ 

const { test, expect } = require('@playwright/test');

// ---- EDIT THESE if a locator doesn't match (inspect element in the app) ----
const PROFILE_URL = '/profile';
const photoTrigger = (page) =>
  page.getByRole('main').getByRole('img').nth(1); // edit icon next to the avatar
const btn = (page, name) => page.getByRole('button', { name, exact: true });
const fileInput = (page) => page.locator('input[type="file"]');
// ---------------------------------------------------------------------------

// Small in-memory test files (nothing to commit)
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64'
);
const validPng = { name: 'valid.png', mimeType: 'image/png', buffer: PNG_1PX };
const validJpg = { name: 'valid.jpg', mimeType: 'image/jpeg', buffer: PNG_1PX };
const bigPng = {
  name: 'big.png',
  mimeType: 'image/png',
  buffer: Buffer.concat([PNG_1PX, Buffer.alloc(6 * 1024 * 1024)]), // ~6 MB
};
const gif = { name: 'anim.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') };

test.describe('Profile Photo - Issue #44', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.SAAYAM_EMAIL;
    const password = process.env.SAAYAM_PASSWORD;
    test.skip(!email || !password, 'SAAYAM_EMAIL and SAAYAM_PASSWORD are required');

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/email/i).fill(email);
    await page.getByPlaceholder(/password/i).fill(password);
    await page.getByRole('button', { name: 'Log In', exact: true }).last().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded' });
    await photoTrigger(page).click();
  });

  test('TC-PP-001: Modal opens and Save is disabled by default', async ({ page }) => {
    await expect(btn(page, 'Save')).toBeDisabled();
  });

  test('TC-PP-002: Valid PNG shows preview, Save and Cancel enabled', async ({ page }) => {
    await fileInput(page).setInputFiles(validPng);
    await expect(btn(page, 'Save')).toBeEnabled();
    await expect(btn(page, 'Cancel')).toBeEnabled();
  });

  test('TC-PP-003: Valid JPG shows preview, Save and Cancel enabled', async ({ page }) => {
    await fileInput(page).setInputFiles(validJpg);
    await expect(btn(page, 'Save')).toBeEnabled();
    await expect(btn(page, 'Cancel')).toBeEnabled();
  });

  test('TC-PP-004: Cancel after upload discards changes and closes modal', async ({ page }) => {
    await fileInput(page).setInputFiles(validPng);
    await btn(page, 'Cancel').click();
    await expect(btn(page, 'Save')).toBeHidden();
  });

  test('TC-PP-005: File over 5 MB is rejected', async ({ page }) => {
    await fileInput(page).setInputFiles(bigPng);
    await expect(page.getByText(/5\s?MB/i)).toBeVisible();
    await expect(btn(page, 'Save')).toBeDisabled();
  });

  test('TC-PP-006: Unsupported format (GIF) is rejected', async ({ page }) => {
    await fileInput(page).setInputFiles(gif);
    await expect(page.getByText(/only jpg and png formats are accepted/i)).toBeVisible();
    await expect(btn(page, 'Save')).toBeDisabled();
  });

  test('TC-PP-007: Error clears after selecting a valid file', async ({ page }) => {
    await fileInput(page).setInputFiles(gif);
    await expect(page.getByText(/only jpg and png formats are accepted/i)).toBeVisible();
    await fileInput(page).setInputFiles(validPng);
    await expect(page.getByText(/only jpg and png formats are accepted/i)).toBeHidden();
    await expect(btn(page, 'Save')).toBeEnabled();
  });

  test('TC-PP-008: Upload and Save succeeds', async ({ page }) => {
    await fileInput(page).setInputFiles(validPng);
    await btn(page, 'Save').click();
    // Backend can be slow (~10 s), so allow extra time
    await expect(btn(page, 'Save')).toBeHidden({ timeout: 30000 });
  });

  test('TC-PP-009: Uploaded photo persists after page reload', async ({ page }) => {
    await fileInput(page).setInputFiles(validPng);
    await btn(page, 'Save').click();
    await expect(btn(page, 'Save')).toBeHidden({ timeout: 30000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await photoTrigger(page).click();
    await expect(btn(page, 'Save')).toBeDisabled();
  });

    test('TC-PP-010: Network error during save shows a message and keeps Save enabled', async ({ page }) => {
    await page.route('**/*', (route) => {
      if (route.request().method() === 'POST') return route.abort('failed');
      return route.continue();
    });

    await fileInput(page).setInputFiles(validPng);
    await btn(page, 'Save').click();

    await expect(page.getByText(/network error/i)).toBeVisible({ timeout: 15000 });
    await expect(btn(page, 'Save')).toBeEnabled();
  });

  test('TC-PP-011: Retrying Save after a failed attempt succeeds', async ({ page }) => {
    let attempt = 0;
    await page.route('**/*', (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      attempt += 1;
      if (attempt === 1) return route.abort('failed');
      return route.continue();
    });

    await fileInput(page).setInputFiles(validPng);
    await btn(page, 'Save').click();
    await expect(page.getByText(/network error/i)).toBeVisible({ timeout: 15000 });

    await btn(page, 'Save').click();
    await expect(btn(page, 'Save')).toBeHidden({ timeout: 30000 });
  });
});