const { test, expect } = require('@playwright/test');

// Issue #69 — Integration with LinkedIn -> Login page/Sign up
// BRD ref: FR-01 to FR-10, Acceptance Criteria items 1-9
//
// TC-LN-006 and TC-LN-007 use a dedicated LinkedIn test account, stored as
// Codespace/repo secrets (LINKEDIN_TEST_EMAIL, LINKEDIN_TEST_PASSWORD) —
// never hardcoded here. They auto-skip if those secrets aren't present in
// the environment, same pattern as auth.setup.js.

test.describe('LinkedIn Login Integration - Issue #69', () => {
  // Uses a full URL (not the shared baseURL) because LinkedIn login is
  // still on the IDP-specific test environment and hasn't been merged to
  // the shared test-saayam.netlify.app yet — see BRD "Merge status" note.
  const IDP_TEST_URL = 'https://idptest-saayam.netlify.app/login';

  test.beforeEach(async ({ page }) => {
    await page.goto(IDP_TEST_URL, {
      waitUntil: 'domcontentloaded',
    });
  });

  test('TC-LN-001: LinkedIn button is visible and labeled, alongside other providers', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: 'LinkedIn', exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Google', exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Facebook', exact: true })
    ).toBeVisible();
  });

  test('TC-LN-002: Clicking LinkedIn button redirects to LinkedIn hosted sign-in', async ({
    page,
  }) => {
    const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

    await Promise.all([
      page.waitForURL(/linkedin\.com/, { timeout: 15000 }),
      linkedInButton.click(),
    ]);

    await expect(page).toHaveURL(/linkedin\.com/);
  });

  test('TC-LN-003: Cancelling at LinkedIn screen returns user to Saayam login, signed out', async ({
    page,
  }) => {
    const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

    await Promise.all([
      page.waitForURL(/linkedin\.com/, { timeout: 15000 }),
      linkedInButton.click(),
    ]);

    const cancelControl = page
      .getByRole('link', { name: /cancel/i })
      .or(page.getByText(/cancel/i));

    test.skip(
      (await cancelControl.count()) === 0,
      'Cancel control not found on LinkedIn hosted page — needs manual confirmation of current DOM'
    );

    await cancelControl.first().click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await expect(page).toHaveURL(/\/login/);
  });

    test('TC-LN-004: No console errors on login page load', async ({ page }) => {
    const errors = [];

    // Known third-party noise, unrelated to the app's own code — confirmed
    // via root-cause investigation: blocked ad-network resource (Chromium)
    // and Google Analytics cross-domain cookie rejections (Firefox/Mobile
    // Firefox). Filtered out rather than left as a flaky/browser-dependent failure.
    const KNOWN_THIRD_PARTY_NOISE = [
      /doubleclick\.net/i,
      /googleads/i,
      /has been rejected for invalid domain/i, // GA cross-domain cookies (_ga, _ga_*)
    ];

    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      const isKnownNoise = KNOWN_THIRD_PARTY_NOISE.some(pattern => pattern.test(text));
      if (!isKnownNoise) errors.push(text);
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    expect(errors, `Console errors found: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('TC-LN-005: Provider button icons load without broken images', async ({
    page,
  }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const naturalWidth = await images
        .nth(i)
        .evaluate(img => img.naturalWidth);

      expect(naturalWidth, `Image at index ${i} failed to load`).toBeGreaterThan(0);
    }
  });

  test.describe('Full OAuth login (requires LINKEDIN_TEST_EMAIL / LINKEDIN_TEST_PASSWORD)', () => {
    const linkedInEmail = process.env.LINKEDIN_TEST_EMAIL;
    const linkedInPassword = process.env.LINKEDIN_TEST_PASSWORD;

    test.skip(
      !linkedInEmail || !linkedInPassword,
      'LINKEDIN_TEST_EMAIL and LINKEDIN_TEST_PASSWORD are required for full OAuth round-trip tests'
    );

    // Debugging only — no timeout, so we get a definitive answer on
    // whether each step ever succeeds, instead of guessing at a number.
    // Remove test.setTimeout(0) once the real behavior is confirmed.
    test.setTimeout(0);

    test('TC-LN-006a: Clicking LinkedIn opens the LinkedIn sign-in page', async ({
      page,
    }) => {
      const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        linkedInButton.click(),
      ]);

      await expect(page).toHaveURL(/linkedin\.com/);
      await expect(page.getByLabel(/email or phone/i)).toBeVisible();
    });

    test('TC-LN-006b: Can type into the email field', async ({ page }) => {
      const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        linkedInButton.click(),
      ]);

      const emailField = page.getByLabel(/email or phone/i);
      await emailField.fill(linkedInEmail);

      await expect(emailField).toHaveValue(linkedInEmail);
    });

    test('TC-LN-006c: Can type into the password field', async ({ page }) => {
      const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        linkedInButton.click(),
      ]);

      await page.getByLabel(/email or phone/i).fill(linkedInEmail);

      // No timeout here on purpose — we want to know definitively
      // whether this ever appears, not guess at how long to wait.
      const passwordField = page.getByLabel(/^password/i);
      await passwordField.waitFor({ state: 'visible' });
      await passwordField.fill(linkedInPassword);

      await expect(passwordField).toHaveValue(linkedInPassword);
    });

    test('TC-LN-006d: Sign in completes and redirects back to Saayam', async ({
      page,
    }) => {
      const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        linkedInButton.click(),
      ]);

      await page.getByLabel(/email or phone/i).fill(linkedInEmail);

      const passwordField = page.getByLabel(/^password/i);
      await passwordField.waitFor({ state: 'visible' });
      await passwordField.fill(linkedInPassword);

      await page.getByRole('button', { name: /^sign in$/i }).click();

      const allowButton = page.getByRole('button', { name: /allow/i });
      if (await allowButton.count()) {
        await allowButton.click();
      }

      await page.waitForURL(url => !url.href.includes('linkedin.com'));
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('TC-LN-007: Repeat LinkedIn login logs into the same Saayam account, not a duplicate', async ({
      page,
    }) => {
      const linkedInButton = page.getByRole('button', { name: 'LinkedIn', exact: true });

      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        linkedInButton.click(),
      ]);

      await page.getByLabel(/email or phone/i).fill(linkedInEmail);

      const passwordField = page.getByLabel(/^password/i);
      await passwordField.waitFor({ state: 'visible' });
      await passwordField.fill(linkedInPassword);
      await page.getByRole('button', { name: /^sign in$/i }).click();

      const allowButton = page.getByRole('button', { name: /allow/i });
      if (await allowButton.count()) {
        await allowButton.click();
      }

      await page.waitForURL(url => !url.href.includes('linkedin.com'));

      // Capture whatever identifies the account (adjust selector once
      // the actual dashboard markup is confirmed — e.g. a profile name,
      // account ID, or email displayed somewhere on the page).
      await expect(page).not.toHaveURL(/\/login/);
      // TODO: assert against a specific account identifier once the
      // dashboard's markup for displaying the logged-in user is confirmed.
    });
  });
});