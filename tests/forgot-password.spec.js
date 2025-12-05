import { test, expect } from '@playwright/test';

test.describe('Saayam Forgot Password Page Tests', () => {

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

  // Group 4: Core Functionality
  test.describe('Reset Flow', () => {
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
