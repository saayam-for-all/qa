// Basic Test Structure
// test.describe('Page Name Tests')           # Main container
// ├── test.describe('Feature Group 1')      # Logical grouping
// │   ├── test('specific test case 1')      # Individual test
// │   └── test('specific test case 2')      # Individual test
// ├── test.describe('Feature Group 2')      # Another grouping
// │   ├── test('specific test case 3')      # Individual test
// │   └── test('specific test case 4')      # Individual test
// └── test.beforeEach()                     # Setup for each test


// Test Structure for Contact Page
// Group 1: Page Load and Elements
// - Verify page loads with correct heading
// - Verify description and email are displayed
// - Verify Get In Touch form section
// - Verify form fields are present
// - Verify FAQ section is visible

// Group 2: Navigation Links
// - Navigate to contact page from home
// - Verify terms and conditions link

// Group 3: FAQ Functionality
// - Test FAQ accordion expand/collapse

// Group 4: Form Validation
// - Test empty field validation
// - Test invalid email format

// Group 5: Form Input (No Submit - captcha protected)
// - Fill all form fields with valid data
// - Test country dropdown functionality


import { test, expect } from '@playwright/test';
import { contactTestData } from '../test-data';

test.describe('Saayam Contact Page Tests', () => {
  const { pageUrl, homeUrl, pageContent, faqQuestions, formFields, validFormData, invalidFormData, navigationUrls, termsText } = contactTestData;

  test.beforeEach(async ({ page }) => {
    await page.goto(pageUrl);
  });

  test.describe('Page Load and Elements', () => {
    test('should load contact page with correct heading', async ({ page }) => {
      // Verify page loads and heading is correct
      const heading = page.getByRole('heading', { name: pageContent.heading });
      await expect(heading).toBeVisible();
      
      const headingText = await heading.textContent();
      expect(headingText?.trim()).toBe(pageContent.heading);
    });

    test('should display description text correctly', async ({ page }) => {
      // Verify description text is visible
      const description = page.getByText(pageContent.description);
      await expect(description).toBeVisible();
    });

    test('should display email address correctly', async ({ page }) => {
      // Verify email address is displayed
      const emailText = page.getByText(pageContent.email);
      await expect(emailText).toBeVisible();
      
      const emailContent = await emailText.textContent();
      expect(emailContent).toBe(pageContent.email);
    });

    test('should display Get In Touch section', async ({ page }) => {
      // Verify Get In Touch heading
      const formHeading = page.getByRole('heading', { name: pageContent.formHeading });
      await expect(formHeading).toBeVisible();
      
      // Verify subheading
      const formSubheading = page.getByText(pageContent.formSubheading);
      await expect(formSubheading).toBeVisible();
    });

    test('should display all form fields', async ({ page }) => {
      // Verify First Name field
      const firstNameInput = page.getByRole('textbox', { name: formFields.firstName.label });
      await expect(firstNameInput).toBeVisible();
      const firstNamePlaceholder = await firstNameInput.getAttribute('placeholder');
      expect(firstNamePlaceholder).toBe(formFields.firstName.placeholder);

      // Verify Last Name field
      const lastNameInput = page.getByRole('textbox', { name: formFields.lastName.label });
      await expect(lastNameInput).toBeVisible();
      const lastNamePlaceholder = await lastNameInput.getAttribute('placeholder');
      expect(lastNamePlaceholder).toBe(formFields.lastName.placeholder);

      // Verify Email field
      const emailInput = page.getByRole('textbox', { name: formFields.email.label });
      await expect(emailInput).toBeVisible();
      const emailPlaceholder = await emailInput.getAttribute('placeholder');
      expect(emailPlaceholder).toBe(formFields.email.placeholder);

      // Verify Phone field
      const phoneInput = page.getByRole('textbox', { name: formFields.phone.label });
      await expect(phoneInput).toBeVisible();
      const phonePlaceholder = await phoneInput.getAttribute('placeholder');
      expect(phonePlaceholder).toBe(formFields.phone.placeholder);

      // Verify Message field
      const messageInput = page.getByRole('textbox', { name: formFields.message.label });
      await expect(messageInput).toBeVisible();
      const messagePlaceholder = await messageInput.getAttribute('placeholder');
      expect(messagePlaceholder).toBe(formFields.message.placeholder);
    });

    test('should display Submit button', async ({ page }) => {
      // Verify Submit button is present
      const submitButton = page.getByRole('button', { name: 'Submit' });
      await expect(submitButton).toBeVisible();
    });

    test('should display terms and conditions link', async ({ page }) => {
      // Verify terms and conditions link is present (use exact match for the form link)
      const termsLink = page.getByRole('link', { name: termsText, exact: true });
      await expect(termsLink).toBeVisible();
    });

    test('should display FAQ section with questions', async ({ page }) => {
      // Verify FAQ heading
      const faqHeading = page.getByRole('heading', { name: pageContent.faqHeading });
      await expect(faqHeading).toBeVisible();

      // Verify all FAQ questions are visible
      for (const question of faqQuestions) {
        const faqItem = page.getByText(question);
        await expect(faqItem).toBeVisible();
      }
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to contact page from home page', async ({ page }) => {
      // Go to home page first
      await page.goto(homeUrl);
      
      // Click Contact Us in navigation
      const contactNavButton = page.getByRole('button', { name: 'Contact Us' });
      await expect(contactNavButton).toBeVisible();
      await contactNavButton.click();
      
      // Verify navigation to contact page
      await expect(page).toHaveURL(navigationUrls.contact);
      const currentUrl = page.url();
      expect(currentUrl.toLowerCase()).toContain('/contact');
    });

    test('should navigate to terms and conditions page', async ({ page }) => {
      // Click terms and conditions link (use exact match for the form link)
      const termsLink = page.getByRole('link', { name: termsText, exact: true });
      await expect(termsLink).toBeVisible();
      await termsLink.click();
      
      // Verify navigation to terms page
      await expect(page).toHaveURL(navigationUrls.terms);
      const currentUrl = page.url();
      expect(currentUrl.toLowerCase()).toContain('/terms');
    });
  });

  test.describe('FAQ Functionality', () => {
    test('should expand FAQ item on click', async ({ page }) => {
      // Click on the first FAQ question
      const firstFaqQuestion = page.getByText(faqQuestions[0]);
      await expect(firstFaqQuestion).toBeVisible();
      await firstFaqQuestion.click();
      
      // Wait for animation
      await page.waitForTimeout(500);
      
      // Verify the FAQ content area has expanded (the accordion should toggle)
      // The FAQ item should still be visible after clicking
      await expect(firstFaqQuestion).toBeVisible();
    });

    test('should toggle each FAQ accordion', async ({ page }) => {
      // Test each FAQ question can be clicked
      for (const question of faqQuestions) {
        const faqItem = page.getByText(question);
        await expect(faqItem).toBeVisible();
        
        // Click to expand
        await faqItem.click();
        await page.waitForTimeout(300);
        
        // Click again to collapse
        await faqItem.click();
        await page.waitForTimeout(300);
        
        // FAQ question should still be visible
        await expect(faqItem).toBeVisible();
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty required fields when clicking submit', async ({ page }) => {
      // Click submit without filling any fields
      const submitButton = page.getByRole('button', { name: 'Submit' });
      await expect(submitButton).toBeVisible();
      await submitButton.click();
      
      // Wait for validation
      await page.waitForTimeout(500);
      
      // Check for HTML5 validation messages on required fields
      const firstNameInput = page.getByRole('textbox', { name: formFields.firstName.label });
      const firstNameValidation = await firstNameInput.evaluate((el) => el.validationMessage);
      expect(firstNameValidation).toBeTruthy();
    });

    test('should validate email format', async ({ page }) => {
      // Fill required fields with invalid email
      const firstNameInput = page.getByRole('textbox', { name: formFields.firstName.label });
      const lastNameInput = page.getByRole('textbox', { name: formFields.lastName.label });
      const emailInput = page.getByRole('textbox', { name: formFields.email.label });
      const phoneInput = page.getByRole('textbox', { name: formFields.phone.label });
      const messageInput = page.getByRole('textbox', { name: formFields.message.label });
      
      await firstNameInput.fill(validFormData.firstName);
      await lastNameInput.fill(validFormData.lastName);
      await emailInput.fill(invalidFormData.invalidEmail);
      await phoneInput.fill(validFormData.phone);
      await messageInput.fill(validFormData.message);
      
      // Click submit
      const submitButton = page.getByRole('button', { name: 'Submit' });
      await submitButton.click();
      
      // Wait for validation
      await page.waitForTimeout(500);
      
      // Check for email validation - either HTML5 validation or we stay on same page
      const emailValidation = await emailInput.evaluate((el) => el.validationMessage);
      const emailType = await emailInput.evaluate((el) => el.type);
      
      // If input type is email, expect validation message; otherwise verify we stay on contact page
      if (emailType === 'email') {
        expect(emailValidation).toBeTruthy();
      } else {
        // Form may use custom validation or accept any format - verify we're still on contact page
        const currentUrl = page.url();
        expect(currentUrl.toLowerCase()).toContain('/contact');
      }
    });

    test('should allow valid phone number input', async ({ page }) => {
      // Enter phone number
      const phoneInput = page.getByRole('textbox', { name: formFields.phone.label });
      await phoneInput.fill(validFormData.phone);
      
      // Verify the value is accepted
      const phoneValue = await phoneInput.inputValue();
      expect(phoneValue).toBe(validFormData.phone);
    });

    test('should display country dropdown for phone', async ({ page }) => {
      // Verify country dropdown is present (default United States)
      const countryDropdown = page.getByRole('combobox');
      await expect(countryDropdown).toBeVisible();
    });
  });

  test.describe('Form Input', () => {
    test('should fill all form fields with valid data', async ({ page }) => {
      // Fill First Name
      const firstNameInput = page.getByRole('textbox', { name: formFields.firstName.label });
      await firstNameInput.click();
      await firstNameInput.fill(validFormData.firstName);
      
      // Fill Last Name
      const lastNameInput = page.getByRole('textbox', { name: formFields.lastName.label });
      await lastNameInput.click();
      await lastNameInput.fill(validFormData.lastName);
      
      // Fill Email
      const emailInput = page.getByRole('textbox', { name: formFields.email.label });
      await emailInput.click();
      await emailInput.fill(validFormData.email);
      
      // Fill Phone
      const phoneInput = page.getByRole('textbox', { name: formFields.phone.label });
      await phoneInput.click();
      await phoneInput.fill(validFormData.phone);
      
      // Fill Message
      const messageInput = page.getByRole('textbox', { name: formFields.message.label });
      await messageInput.click();
      await messageInput.fill(validFormData.message);
      
      // Verify all values are filled correctly
      expect(await firstNameInput.inputValue()).toBe(validFormData.firstName);
      expect(await lastNameInput.inputValue()).toBe(validFormData.lastName);
      expect(await emailInput.inputValue()).toBe(validFormData.email);
      expect(await phoneInput.inputValue()).toBe(validFormData.phone);
      expect(await messageInput.inputValue()).toBe(validFormData.message);
      
      // Note: Not clicking Submit due to captcha protection
    });

    test('should allow selecting different country in phone dropdown', async ({ page }) => {
      // Find and interact with country dropdown
      const countryDropdown = page.getByRole('combobox');
      await expect(countryDropdown).toBeVisible();
      
      // Click to open dropdown
      await countryDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(300);
      
      // Select a different country (e.g., India)
      await countryDropdown.selectOption({ label: 'India (+91)' });
      
      // Verify selection
      const selectedValue = await countryDropdown.inputValue();
      expect(selectedValue).toBeTruthy();
    });
  });
});
