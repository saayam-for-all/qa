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
});