import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

const BASE_URL = 'https://test-saayam.netlify.app';

async function safeFill(locator, value) {
  try {
    if (await locator.isVisible()) {
      await locator.fill(value);
    }
  } catch {}
}

// ------------------------
// 1) Fix profile address
// ------------------------
async function fixProfileAddress(page) {
  const editProfileLink = page.getByRole('link', { name: /edit profile/i });
  await editProfileLink.click();

  await page.waitForURL('**/profile**', { timeout: 60000 });
  await page.waitForLoadState('networkidle');

  const personalInfoTab = page.getByRole('link', { name: /personal information/i });
  if (await personalInfoTab.isVisible().catch(() => false)) {
    await personalInfoTab.click();
    await page.waitForLoadState('networkidle');
  }

  const editButton = page.getByRole('button', { name: /^edit$/i }).first();
  if (await editButton.isVisible().catch(() => false)) {
    await editButton.click();
    await page.waitForTimeout(500);
  }

  const streetLabel = page.locator('label:has-text("Street Address")').first();
  await streetLabel.locator('..').locator('input').fill('5400 E Williams Blvd');

  const cityLabel = page.locator('label:has-text("City")').first();
  await cityLabel.locator('..').locator('input').fill('Tucson');

  const stateLabel = page.locator('label:has-text("State")').first();
  const stateInput = stateLabel.locator('..').locator('input');
  await stateInput.click();
  await stateInput.fill('Arizona');
  await stateInput.press('Enter');

  const zipLabel = page.locator('label:has-text("Zip Code")').first();
  await zipLabel.locator('..').locator('input').fill('85711');

  const saveBtn = page.getByRole('button', { name: /^save$/i });
  if (await saveBtn.isVisible().catch(() => false)) await saveBtn.click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const backBtn = page.getByRole('button', { name: /back to dashboard/i });
  if (await backBtn.isVisible().catch(() => false)) {
    await Promise.all([
      backBtn.click(),
      page.waitForURL('**/dashboard**', { timeout: 60000 }),
    ]);
  } else {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  }

  await page.waitForLoadState('networkidle');
}

// ------------------------
// 2) Go to Volunteer Flow
// ------------------------
async function goToVolunteerFlow(page) {
  const volunteerLink = page.getByRole('link', { name: /become a volunteer/i });
  await expect(volunteerLink).toBeVisible({ timeout: 15000 });
  await volunteerLink.click();

  const warning = page.getByText(
    'Please add your address in Profile to continue',
    { exact: false }
  );

  // bounded wait instead of blind sleep (won't fail if it never appears)
  await warning.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

  if (await warning.isVisible().catch(() => false)) {
    await fixProfileAddress(page);

    const volunteerLinkAgain = page.getByRole('link', { name: /become a volunteer/i });
    await expect(volunteerLinkAgain).toBeVisible({ timeout: 15000 });

    await Promise.all([
      volunteerLinkAgain.click(),
      page.waitForURL('**/promote-to-volunteer**', { timeout: 60000 }),
    ]);
  } else {
    await page.waitForURL('**/promote-to-volunteer**', { timeout: 60000 });
  }

  await page.waitForLoadState('networkidle');
}

// ------------------------
// 3) Scroll T&C + accept
// ------------------------
async function acceptTerms(page) {
  const agreementBox = page.locator('div.scrolling-box');
  await expect(agreementBox).toBeVisible({ timeout: 15000 });

  await agreementBox.evaluate(el => (el.scrollTop = el.scrollHeight));
  await page.waitForTimeout(1500);

  const understoodCheckbox = page.getByRole('checkbox', {
    name: /i have read and understood the document/i,
  });
  await expect(understoodCheckbox).toBeEnabled({ timeout: 5000 });
  await understoodCheckbox.click();

  const nextBtn = page.getByRole('button', { name: /^next$/i });
  await expect(nextBtn).toBeEnabled({ timeout: 15000 });
  await nextBtn.click();

  await page.waitForTimeout(2000);
}

// ------------------------
// 4) Upload Government ID
// ------------------------
// 4) Upload Government ID
async function uploadGovIdAndNext(page) {
  await expect(
    page.getByText(/upload government id/i)
  ).toBeVisible({ timeout: 15000 });

  const idPath = 'test-data/volunteer/Nature.jpg';

  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible({ timeout: 15000 });
  await fileInput.setInputFiles(idPath);

  const nextBtn = page.getByRole('button', { name: /next/i });
  await expect(nextBtn).toBeEnabled({ timeout: 15000 });
  await nextBtn.click();

  // ✅ don’t wait for navigation in SPA
await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(500);

// ✅ confirm we reached Skills page using real elements that exist there
await Promise.race([
  // if your skills page has this checkbox (it did earlier)
  page.getByRole('checkbox', { name: /clothing assistance/i }).waitFor({ state: 'visible', timeout: 15000 }),

  // fallback: any checkbox list appearing (skills list usually contains checkboxes)
  page.locator('input[type="checkbox"]').first().waitFor({ state: 'visible', timeout: 15000 }),

  // fallback: any visible text “skills” (not heading-only)
  page.getByText(/skills/i).first().waitFor({ state: 'visible', timeout: 15000 }),
]).catch(async () => {
  // optional: screenshot for debugging
  await page.screenshot({ path: 'test-results/after-id-next.png', fullPage: true });
  throw new Error('After ID upload -> Next, did not reach Skills page (no expected markers found).');
});
}

// ------------------------
// 5) Skills Page
// ------------------------
async function fillSkillsAndNext(page) {
  // grab all skill checkboxes
  const skillCheckboxes = page.locator('input[type="checkbox"]');

  const count = await skillCheckboxes.count();
  console.log(`Found ${count} skill checkboxes`);

  for (let i = 0; i < count; i++) {
    const checkbox = skillCheckboxes.nth(i);
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  const nextBtn = page.getByRole('button', { name: /^next$/i });
  await expect(nextBtn).toBeEnabled({ timeout: 15000 });
  await nextBtn.click();

  // wait for Availability page (instead of sleep)
  await expect(
    page.getByText(/please provide your available time slots/i)
  ).toBeVisible({ timeout: 30000 });
}

// ------------------------
// 6) Availability Page
// ------------------------
async function fillAvailabilityAndConfirm(page) {
  await expect(
    page.getByText(/please provide your available time slots/i)
  ).toBeVisible({ timeout: 15000 });

  const timeInputs = page.locator('input[placeholder="hh:mm a"]');
  const startInput = timeInputs.nth(0);
  const endInput = timeInputs.nth(1);

  // Start = 12:00 AM
  await startInput.click();
  await page.waitForTimeout(200); // tiny settle (helps WebKit occasionally)
  await page.getByRole('option', { name: /0 hours/i }).first().click();
  await page.getByRole('option', { name: /0 minutes/i }).first().click();
  await page.getByRole('button', { name: /^ok$/i }).click();

  // End = 1:00 AM
  await endInput.click();
  await page.waitForTimeout(200); // tiny settle
  await page.getByRole('option', { name: /1 hours/i }).first().click();
  await page.getByRole('option', { name: /0 minutes/i }).first().click();
  await page.getByRole('button', { name: /^ok$/i }).click();

  await page.waitForTimeout(1000);

  const confirmBtn = page.getByRole('button', { name: /confirm/i });
  await expect(confirmBtn).toBeEnabled({ timeout: 15000 });
  await confirmBtn.click();

 

  // wait for the Close button to appear instead of sleeping
const closeBtn = page.getByRole('button', { name: /close/i });
await expect(closeBtn).toBeVisible({ timeout: 30000 });
await closeBtn.click();

  
}

// -----------------------------
// 7) Review Page → Close
// -----------------------------
async function closeReviewPage(page) {
  // Click CLOSE if it exists, then END the test immediately
  const closeBtn = page.locator('a:has-text("CLOSE"), button:has-text("CLOSE")').first();

  // Try click, but don't wait forever if it doesn't show up
  if (await closeBtn.count()) {
    try {
      await closeBtn.click({ timeout: 2000 });
    } catch (e) {
      // ignore
    }
  }

  // Stop here — don't wait for dashboard / navigation
  return;
}


// ------------------------
// MAIN TEST
// ------------------------
test.describe('TC07 — Volunteer Flow', () => {
  test('login → fix profile → volunteer → T&C → ID → skills → availability', async ({ page }) => {
     test.setTimeout(90_000);
    

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

if (!email || !password) {
  throw new Error('Missing TEST_EMAIL or TEST_PASSWORD in .env');
}

await page.getByRole('textbox', { name: /email/i }).fill(email);
await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/dashboard**', { timeout: 60000 });

    await goToVolunteerFlow(page);

    await expect(
      page.getByRole('heading', { name: /review & acknowledge terms/i })
    ).toBeVisible({ timeout: 15000 });

    await acceptTerms(page);
    await uploadGovIdAndNext(page);
    await fillSkillsAndNext(page);
    await fillAvailabilityAndConfirm(page);
    await closeReviewPage(page);

    console.log('🎉 FULL VOLUNTEER FLOW COMPLETED SUCCESSFULLY!');

  });
});


