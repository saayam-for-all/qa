const { test, expect } = require('@playwright/test');

test.describe('Log In Page - Issue #54', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', {
      waitUntil: 'domcontentloaded',
    });
  });

  test('TC-LI-001: Login page loads with required controls', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);

    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();

    await expect(
      page
        .getByRole('button', {
          name: 'Log In',
          exact: true,
        })
        .last()
    ).toBeVisible();

    await expect(page.getByText(/forgot password/i)).toBeVisible();
    await expect(page.getByText(/sign up/i)).toBeVisible();
  });

  test('TC-LI-002: Blank email validation is displayed', async ({ page }) => {
    const password = page.getByPlaceholder(/password/i);

    const loginButton = page
      .getByRole('button', {
        name: 'Log In',
        exact: true,
      })
      .last();

    await password.fill('TestPassword123!');
    await loginButton.click();

    await expect(
      page.getByText(/email address is required/i)
    ).toBeVisible();
  });

  test('TC-LI-003: Blank password validation is displayed', async ({ page }) => {
    const email = page.getByPlaceholder(/email/i);

    const loginButton = page
      .getByRole('button', {
        name: 'Log In',
        exact: true,
      })
      .last();

    await email.fill('qa-test@example.com');
    await loginButton.click();

    await expect(
      page.getByText(/password is required/i)
    ).toBeVisible();
  });

  test('TC-LI-004: Password is masked by default', async ({ page }) => {
    const password = page.getByPlaceholder(/password/i);

    await expect(password).toHaveAttribute('type', 'password');
  });

  test('TC-LI-005: Password visibility toggle preserves entered value', async ({
    page,
  }) => {
    const password = page.getByPlaceholder('Password');

    const visibilityToggle = password.locator(
      'xpath=following-sibling::button'
    );

    await password.fill('TestPassword123!');

    // Password should be masked by default.
    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('TestPassword123!');

    // Show password.
    await visibilityToggle.click();

    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('TestPassword123!');

    // Hide password again.
    await visibilityToggle.click();

    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('TestPassword123!');
  });

  test('TC-LI-006: Forgot Password link navigates correctly', async ({
    page,
  }) => {
    await page.getByText(/forgot password/i).click();

    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('TC-LI-007: Sign Up link navigates correctly', async ({ page }) => {
    await page.getByText(/sign up/i).last().click();

    await expect(page).toHaveURL(/\/signup/);
  });

  test('TC-LI-008: Refresh clears unsubmitted login values', async ({
    page,
  }) => {
    const email = page.getByPlaceholder(/email/i);
    const password = page.getByPlaceholder(/password/i);

    await email.fill('qa-test@example.com');
    await password.fill('TestPassword123!');

    await page.reload({
      waitUntil: 'domcontentloaded',
    });

    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');
  });

  test('TC-LI-009: Login form supports correct keyboard focus order', async ({
    page,
  }) => {
    const email = page.getByPlaceholder(/email/i);
    const password = page.getByPlaceholder(/password/i);

    const visibilityToggle = password.locator(
      'xpath=following-sibling::button'
    );

    const forgotPassword = page.getByText(/forgot password/i);

    const loginButton = page
      .getByRole('button', {
        name: 'Log In',
        exact: true,
      })
      .last();

    const signUp = page.getByText(/sign up/i).last();

    // Start from the email field.
    await email.focus();
    await expect(email).toBeFocused();

    // Email -> Password
    await page.keyboard.press('Tab');
    await expect(password).toBeFocused();

    // Password -> Password visibility toggle
    await page.keyboard.press('Tab');
    await expect(visibilityToggle).toBeFocused();

    // Visibility toggle -> Forgot Password
    await page.keyboard.press('Tab');
    await expect(forgotPassword).toBeFocused();

    // Forgot Password -> Log In
    await page.keyboard.press('Tab');
    await expect(loginButton).toBeFocused();

    // Log In -> Sign Up
    await page.keyboard.press('Tab');
    await expect(signUp).toBeFocused();
  });

  test('TC-LI-010: Invalid login shows generic error, retains email, and clears password', async ({
    page,
  }, testInfo) => {
    const email = page.getByPlaceholder(/email/i);
    const password = page.getByPlaceholder(/password/i);

    const loginButton = page
      .getByRole('button', {
        name: 'Log In',
        exact: true,
      })
      .last();

    // Generate a unique invalid email for each project execution.
    // This prevents backend lockout state from one browser
    // affecting another browser.
    const projectName = testInfo.project.name.replace(
      /[^a-z0-9]/gi,
      '-'
    );

    const testEmail =
      `qa-invalid-${projectName}-${Date.now()}@example.com`;

    await email.fill(testEmail);
    await password.fill('WrongPassword123!');

    await loginButton.click();

    await expect(
      page.getByText('Invalid email or password.', {
        exact: true,
      })
    ).toBeVisible();

    // User should remain on login page.
    await expect(page).toHaveURL(/\/login/);

    // Email should remain populated.
    await expect(email).toHaveValue(testEmail);

    // Password should be cleared.
    await expect(password).toHaveValue('');
  });

  test('TC-LI-011: Valid credentials log in successfully and redirect user', async ({
    page,
  }) => {
    const email = process.env.SAAYAM_EMAIL;
    const passwordValue = process.env.SAAYAM_PASSWORD;

    test.skip(
      !email || !passwordValue,
      'SAAYAM_EMAIL and SAAYAM_PASSWORD are required for successful login test'
    );

    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);

    const loginButton = page
      .getByRole('button', {
        name: 'Log In',
        exact: true,
      })
      .last();

    await emailInput.fill(email);
    await passwordInput.fill(passwordValue);

    await loginButton.click();

    // Functional login validation.
    // Allow sufficient time for backend authentication and redirect.
    await expect(page).not.toHaveURL(/\/login/, {
      timeout: 15000,
    });
  });

  test('TC-LI-012: Login page renders correctly across required viewport widths', async ({
    page,
  }) => {
    const viewportWidths = [320, 768, 1024, 1440];

    for (const width of viewportWidths) {
      await page.setViewportSize({
        width,
        height: 900,
      });

      await page.goto('/login', {
        waitUntil: 'domcontentloaded',
      });

      const email = page.getByPlaceholder(/email/i);
      const password = page.getByPlaceholder(/password/i);

      const loginButton = page
        .getByRole('button', {
          name: 'Log In',
          exact: true,
        })
        .last();

      await expect(email).toBeVisible();
      await expect(password).toBeVisible();
      await expect(loginButton).toBeVisible();

      // Verify the page does not introduce horizontal scrolling.
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(
        hasHorizontalScroll,
        `Horizontal scrolling detected at ${width}px viewport`
      ).toBeFalsy();

      // Verify important login controls remain inside the viewport.
      const controls = [
        email,
        password,
        loginButton,
        page.getByText(/forgot password/i),
        page.getByText(/sign up/i).last(),
      ];

      for (const control of controls) {
        const box = await control.boundingBox();

        expect(
          box,
          `Control was not rendered at ${width}px viewport`
        ).not.toBeNull();

        expect(
          box.x,
          `Control extends beyond left side at ${width}px`
        ).toBeGreaterThanOrEqual(0);

        expect(
          box.x + box.width,
          `Control extends beyond right side at ${width}px`
        ).toBeLessThanOrEqual(width);
      }
    }
  });
});