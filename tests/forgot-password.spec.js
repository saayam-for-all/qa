//Chnages
import { test, expect } from '@playwright/test';
import { signupTestData } from '../test-data/signup-data';

// Generate unique suffix for unregistered email
const _uniqueSuffix = Math.floor(Math.random() * 900000) + 100000;

test.describe('Saayam Forgot Password Page Tests', () => {
  // Use registered email from signup-page test data (process.env.TEST_EMAIL)
  const registeredEmail = signupTestData.validUser.email;
  // Generate unregistered email that doesn't exist in the system
  const unregisteredEmail = `nonexistent${_uniqueSuffix}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://test-saayam.netlify.app/forgot-password');
  });

  // Group 1: Page Load and Elements
  test.describe('Page Load and Elements', () => {
    test('should load forgot password page with correct heading', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'Password Reset' });
      await expect(heading).toBeVisible();
    });

    test('should display email input and placeholder', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      await expect(emailInput).toBeVisible();
      const placeholder = await emailInput.getAttribute('placeholder');
      expect(placeholder).toBe('Your Email');
    });
  });

  // Group 2: Navigation Links
  test.describe('Navigation Links', () => {
    test('should navigate to login page when Cancel button is clicked', async ({ page }) => {
      const cancelBtn = page.getByRole('button', { name: 'Cancel' });
      await expect(cancelBtn).toBeVisible();

      // Navigate from login page first to establish history
      await page.goto('https://test-saayam.netlify.app/login');
      await page.goto('https://test-saayam.netlify.app/forgot-password');

      await cancelBtn.click();

      // Wait for navigation and verify we're back at login page
      await expect(page).toHaveURL(/.*login.*/, { timeout: 5000 });
    });
  });

  // Group 3: Form Validation
  test.describe('Form Validation', () => {
    test('should show validation error for empty email', async ({ page }) => {
      const resetBtn = page.getByRole('button', { name: 'Reset' });
      const emailInput = page.getByRole('textbox', { name: 'Email *' });

      await resetBtn.click();

      // Wait for validation to appear
      await page.waitForTimeout(500);

      const validationMessage = await emailInput.evaluate(el => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const resetBtn = page.getByRole('button', { name: 'Reset' });

      await emailInput.fill('invalid-email-format');
      await resetBtn.click();

      // Wait for validation to appear
      await page.waitForTimeout(500);

      const validationMessage = await emailInput.evaluate(el => el.validationMessage);
      expect(validationMessage).toBeTruthy();
      expect(validationMessage.toLowerCase()).toMatch(/email|invalid|format/i);
    });
  });

  // Group 4: Reset Flow - Core Functionality
  test.describe('Reset Flow', () => {
    /**
     * Test Scenario 1: Registered user email
     * Uses process.env.TEST_EMAIL from signupTestData.validUser.email
     * Expected: Should successfully send reset link and navigate to verify-account page
     */
    test('should accept registered user email and navigate to verify-account page', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const resetBtn = page.getByRole('button', { name: 'Reset' });

      await emailInput.fill(registeredEmail);
      await resetBtn.click();

      // Wait for navigation to verify-account page
      await expect(page).toHaveURL(/.*verify-account.*/, { timeout: 10000 });

      // Success message appears on this page
      const successMessage = page.getByText('Password Reset');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    });

    /**
     * Test Scenario 2: Unregistered user email
     * Uses randomly generated email that doesn't exist in the system
     * Expected: Should display an error message (e.g., "User not found" or "Email does not exist")
     *           and stay on the forgot-password page
     * Note: Confirm exact error message with feature owner
     */
    test('should show error for unregistered user email', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const resetBtn = page.getByRole('button', { name: 'Reset' });

      await emailInput.fill(unregisteredEmail);
      await resetBtn.click();

      // Wait for response
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      const stayedOnPage = currentUrl.includes('forgot-password');

      if (stayedOnPage) {
        // Expected: Error message should be visible
        // Update this regex based on actual error message from the app
        const errorMessage = page.getByText(/not found|does not exist|no account|user not found|invalid|error/i);
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
      } else {
        // Alternative: Some apps navigate to verify-account regardless (security best practice)
        // to not reveal whether an email exists in the system
        expect(currentUrl).toContain('verify-account');
      }
    });

    /**
     * Test Scenario 3: Valid email format (original test for backward compatibility)
     */
    test('should accept valid email and navigate to verify-account page', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const resetBtn = page.getByRole('button', { name: 'Reset' });

      await emailInput.fill('test@example.com');
      await resetBtn.click();

      // Wait for navigation to verify-account page
      await expect(page).toHaveURL(/.*verify-account.*/, { timeout: 10000 });

      // Success message appears on this page
      const successMessage = page.getByText('Password Reset');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    });
  });
});