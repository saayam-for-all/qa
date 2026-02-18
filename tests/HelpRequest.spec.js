import { test, expect } from '@playwright/test';
import { helpRequestTestData as data } from '../test-data';

test('Complete Help Request Flow - Login to Submit', async ({ page }) => {
  test.setTimeout(120000);

  // STEP 1: Login
  await page.goto(data.urls.home);
  await page.getByRole('link', { name: 'Log In' }).click();
  await page.waitForURL(/login/);
  
  await page.getByPlaceholder(/email/i).fill(data.credentials.email);
  await page.getByPlaceholder(/password/i).fill(data.credentials.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // STEP 2: Go to Profile
  await page.getByRole('link', { name: 'Create Help Request' }).click();
  await page.getByRole('link', { name: 'Edit profile' }).click();
  await page.waitForURL(/profile/);

  // STEP 3: Fill Date of Birth
  const dobInput = page.getByPlaceholder('MM/DD/YYYY');
  await dobInput.click({ position: { x: 10, y: 10 } });
  
  const datePicker = page.locator('.react-datepicker');
  await datePicker.waitFor({ state: 'visible', timeout: 10000 });
  
  await page.locator('.react-datepicker__year-read-view').click();
  await page.getByText(data.profileData.dob.year, { exact: true }).click();
  
  await page.locator('.react-datepicker__month-read-view').click();
  await page.getByText(data.profileData.dob.month, { exact: true }).click();
  
  const dayTarget = `${data.profileData.dob.month} ${data.profileData.dob.day}`;
  await page.getByRole('option', { name: new RegExp(dayTarget, 'i') }).click();
  
  await datePicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

  // STEP 4: Fill Gender
  const genderInput = page.locator('label:has-text("Gender") ~ div input[id*="react-select"]').first();
  await genderInput.click();
  await genderInput.fill(data.profileData.gender);
  
  const genderOption = page.getByRole('option', { name: new RegExp(`^${data.profileData.gender}$`, 'i') }).first();
  await genderOption.waitFor({ state: 'visible', timeout: 10000 });
  await genderOption.click();

  // STEP 5: Fill Address
  await page.locator('input[name="streetAddress"]').fill(data.profileData.streetAddress);
  await page.locator('input[name="city"]').fill(data.profileData.city);

  // STEP 6: Fill State
  const stateInput = page.locator('label:has-text("State") ~ div input[id*="react-select"]').first();
  await stateInput.click();
  await stateInput.fill(data.profileData.state);
  
  const stateOption = page.getByRole('option', { name: new RegExp(`^${data.profileData.state}$`, 'i') }).first();
  await stateOption.waitFor({ state: 'visible', timeout: 10000 });
  await stateOption.click();

  // STEP 7: Fill Zip and Save
  await page.locator('input[name="zipCode"]').fill(data.profileData.zipCode);
  
  const saveBtn = page.getByRole('button', { name: /Save/i });
  await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
  await saveBtn.click();
  await page.waitForLoadState('networkidle').catch(() => {});

  // STEP 8: Back to Dashboard
  await page.getByRole('button', { name: /Back to Dashboard/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // STEP 9: Create Help Request
  await page.getByRole('link', { name: 'Create Help Request' }).click();
  await page.waitForURL(/request/i, { timeout: 10000 });
  
  await expect(page.getByRole('heading', { name: /Create Help Request/i })).toBeVisible({ timeout: 10000 });

  // STEP 10: Select Category
  const categoryBox = page.getByRole('textbox', { name: 'Category' });
  await categoryBox.click();
  
  const parentCategory = page.getByText('Clothing Assistance', { exact: true }).first();
  await parentCategory.waitFor({ state: 'visible', timeout: 10000 });
  await parentCategory.click();
  
  const childCategory = page.getByText(data.requestData.category, { exact: true }).first();
  await childCategory.waitFor({ state: 'visible', timeout: 10000 });
  await childCategory.click();

  // STEP 11: Fill Subject and Description
  const subjectInput = page.getByRole('textbox', { name: /Subject/i });
  await subjectInput.waitFor({ state: 'visible', timeout: 10000 });
  await subjectInput.fill(data.requestData.subject);

  const descInput = page.getByRole('textbox', { name: /Description/i });
  await descInput.waitFor({ state: 'visible', timeout: 10000 });
  await descInput.fill(data.requestData.description);

  // STEP 12: Submit
  const submitBtn = page.getByRole('button', { name: /Submit/i });
  await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
  await submitBtn.click();
  
  // Optional: Wait for success
  await page.waitForTimeout(2000);
});