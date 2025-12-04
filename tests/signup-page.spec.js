/* Author: Divyasree */
import { test, expect, Page, Locator } from '@playwright/test';
import { signupTestData } from '../testSignupData/signup-data';

class SignupPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Sign Up' });
    this.firstName = page.getByRole('textbox', { name: 'First Name' });
    this.lastName = page.getByRole('textbox', { name: 'Last Name' });
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.phone = page.getByRole('textbox', { name: 'Phone Number' });
    this.password =page.getByRole('textbox', { name: 'Password', exact: true });
    this.confirmPassword = page.getByRole('textbox', { name: 'Confirm Password' });
    this.signupButton = page.getByRole('button', { name: 'Sign up' });
    this.termsCheckbox = page.getByRole('checkbox');
    this.loginText = page.getByText('Already have an account?', { exact: true });
    this.loginLink = page.getByRole('button', { name: 'Log In' });
    this.termsLink = page.getByRole('main').getByRole('link', { name: 'Terms and Conditions' });
    this.country = page.getByLabel('country');
    this.emailExists = page.getByText('User already exists. Please sign in or use a different email.');
  }

  goto() {
    return this.page.goto('https://test-saayam.netlify.app/signup');
  }

  async acceptTerms() {
    await this.termsCheckbox.click();
  }

  async submit() {
    await this.signupButton.click();
  }
}

test.describe('Saayam Signup Page Tests', () => {
  const{validUser, SuccessfulUser, invalidEmailUser, passwordMismatchUser, weakPasswordUsers, passwordRules } = signupTestData;
    let signupPage;
    
    test.beforeEach(async ({ page }) => {
      signupPage = new SignupPage(page);
      await signupPage.goto();
  });

  // Group 1: Page Load and Elements
  test.describe('Page Load and Elements', () => {
    test('should load signup page with correct heading', async ({ page }) => {
      await expect(signupPage.page).toHaveURL(/.*signup.*/);
      await expect(signupPage.heading).toBeVisible();
      expect((await signupPage.heading.textContent())?.trim()).toBe('Sign Up');
    });

    test('should display all input fields and placeholders', async ({ page }) => {
      await expect(signupPage.firstName).toBeVisible();
      expect((await signupPage.firstName.getAttribute('placeholder'))).toBe('First Name');

      await expect(signupPage.lastName).toBeVisible();
      expect((await signupPage.lastName.getAttribute('placeholder'))).toBe('Last Name');

      await expect(signupPage.email).toBeVisible();
      expect((await signupPage.email.getAttribute('placeholder'))).toBe('Email');

      await expect(signupPage.phone).toBeVisible();
      expect((await signupPage.phone.getAttribute('placeholder'))).toBe('Your Phone Number');

      await expect(signupPage.country).toBeDisabled();
      await expect(signupPage.country.locator('option:checked')).toHaveText('United States');

      await expect(signupPage.password).toBeVisible();
      expect((await signupPage.password.getAttribute('placeholder'))).toBe('Password');

      await expect(signupPage.confirmPassword).toBeVisible();
      expect((await signupPage.confirmPassword.getAttribute('placeholder'))).toBe('Confirm Password');
    });

    test('should display Sign Up button and login link', async ({ page }) => {
      await expect(signupPage.signupButton).toBeDisabled();
      await expect(signupPage.termsLink).toHaveAttribute('href', /terms-and-conditions/);
      await signupPage.termsLink.click();
      await expect(signupPage.page).toHaveURL(/.*terms-and-conditions.*/);
      await signupPage.goto();
      await signupPage.acceptTerms();
      await expect(signupPage.signupButton).toBeVisible();

      await expect(signupPage.loginText).toBeVisible();
      await expect(signupPage.loginLink).toBeEnabled();
    });

    test('should load correctly on mobile viewport', async ({ browser }) => {
      await signupPage.page.setViewportSize({ width: 375, height: 812 });
      await signupPage.goto();
      await expect(signupPage.heading).toBeVisible();
      const form = signupPage.page.getByText('Sign UpFirst NameLast');
      await expect(form).toBeVisible();
    });

  });

  // Group 2: Navigation Links
  test.describe('Navigation Links', () => {
    test('should navigate to login page', async ({ page }) => {
      await signupPage.loginLink.click();
      await expect(signupPage.page).toHaveURL(/.*login.*/);
    });
    
    test('should navigate to Terms and conditions page', async ({ page }) => {
      await signupPage.termsLink.click();
      await expect(signupPage.page).toHaveURL(/.*terms-and-conditions.*/);
    });
  });

  // Group 3: Form Validation
  test.describe('Form Validation', () => {
    test('should show errors for empty fields', async ({ page }) => {
      await signupPage.acceptTerms();
      await signupPage.submit();
      await page.waitForTimeout(500);

      const fields = [
        { field: signupPage.firstName,name: "First Name",expected: "First name is required"},
        { field: signupPage.lastName,name: "Last Name",expected: "Last name is required"},
        { field: signupPage.email,name: "Email",expected: "Email is required"},
        { field: signupPage.phone,name: "Phone Number",expected: "Phone number is required"},
        { field: signupPage.confirmPassword,name: "Confirm Password", expected: "Confirm password is required"},
        {expected: "Password must contain at least 8 characters."},
        {expected: "Password must contain at least 1 number."},
        {expected: "Password must contain at least 1 special character."},
        {expected: "Password must contain at least 1 uppercase letter."},
        {expected: "Password must contain at least 1 lowercase letter."},

      ];
      for (const {expected} of fields) {
        const errorLocator = signupPage.page.getByText(expected,{exact:true});
        await expect(errorLocator).toBeVisible();
      }
    });

    test('should show error for invalid email', async ({ page }) => {
      await signupPage.firstName.fill(invalidEmailUser.firstName);
      await signupPage.email.fill(invalidEmailUser.email);
      await signupPage.password.fill(invalidEmailUser.password);
      await signupPage.confirmPassword.fill(invalidEmailUser.confirmPassword);
      await signupPage.acceptTerms();
      await signupPage.submit();
      await page.waitForLoadState('networkidle');
      const emailError = signupPage.page.getByText('Invalid email address');
      await expect(emailError).toBeVisible();
    });

    test('should show error for password mismatch', async ({ page }) => {
      await signupPage.firstName.fill(passwordMismatchUser.firstName);
      await signupPage.email.fill(passwordMismatchUser.email);
      await signupPage.password.fill(passwordMismatchUser.password);
      await signupPage.confirmPassword.fill(passwordMismatchUser.confirmPassword);
      await signupPage.acceptTerms();
      await signupPage.submit();
      const mismatchError = signupPage.page.getByText('Passwords do not match');
      await page.waitForLoadState('networkidle');
      await expect(mismatchError).toBeVisible();
    });

    test('should show error when email is already registered', async ({ page }) => {
      await signupPage.firstName.fill(validUser.firstName);
      await signupPage.lastName.fill(validUser.lastName);
      await signupPage.email.fill(validUser.email);
      await signupPage.phone.fill(validUser.phone);
      await signupPage.password.fill(validUser.password);
      await signupPage.confirmPassword.fill(validUser.confirmPassword);
      await signupPage.acceptTerms();
      await signupPage.submit();
      await signupPage.page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); 
      await expect(signupPage.emailExists).toHaveText(
        'User already exists. Please sign in or use a different email.',
        { timeout: 12000 });
    });

    test('Password visibility toggle icon Validation', async ({ page }) => {
      const toggleIcon = page.getByRole('button').nth(5);
      await expect(toggleIcon).toBeVisible();
      const toggleButton = page.getByRole('button').nth(5);
      await toggleButton.click();
      expect(await page.getByRole('textbox', { name: 'Password', exact: true }).getAttribute('type')).toBe('text');
      await toggleButton.click();
      expect(await page.getByRole('textbox', { name: 'Password', exact: true }).getAttribute('type')).toBe('password');
    });

    // Password requirement validations
    test.describe('Password Requirement Validation', () => {
      const { weakPasswordUsers, passwordRules } = signupTestData;
      weakPasswordUsers.forEach((user) => {
        test(`should validate rule colors for weak password: ${user.password}`, async ({ page }) => {
        await signupPage.firstName.fill(user.firstName);
        await signupPage.lastName.fill(user.lastName);
        await signupPage.email.fill(user.email);
        await signupPage.password.fill(user.password);
        // Check each rule
        for (const ruleText of passwordRules) {
          const ruleElement = page.getByText(ruleText, { exact: true });
          await expect(ruleElement).toBeVisible();
          // console.log(`Rule: ${ruleText}, class:`, await ruleElement.getAttribute('class'));
          if (user.fails.includes(ruleText)) {
            await expect(ruleElement).toHaveClass(/text-red-500|text-sm text-red-500/);
          } else {
            await expect(ruleElement).toHaveClass(/text-green-500|text-sm text-green-500/);
          }
        }
        });
      });
    });
  });

  // Group 4: Core Functionality
  test.describe('Signup Functionality', () => {
    test('should successfully signup with valid data', async ({ page }) => {
      await signupPage.firstName.fill(SuccessfulUser.firstName);
      await signupPage.lastName.fill(SuccessfulUser.lastName);
      await signupPage.email.fill(SuccessfulUser.email);
      await signupPage.phone.fill(SuccessfulUser.phone);
      await signupPage.password.fill(SuccessfulUser.password);
      await signupPage.confirmPassword.fill(SuccessfulUser.confirmPassword);
      await signupPage.acceptTerms();
      await signupPage.submit();
      await page.waitForLoadState('networkidle');
      // The OTP page can take longer to appear; wait for the OTP URL and element (up to 60s)
      await signupPage.page.waitForURL(/.*verify-otp.*/i, { timeout: 120000 });
      const successMessage = page.getByText('Enter OTP code sent to');
      await expect(successMessage).toBeVisible({ timeout: 60000 });
    });
  });
});
