import { test, expect } from '@playwright/test';

const SIGN_OFF_HEADING = 'Sign Off';
const DELETE_CHECKBOX_NAME = /I want to delete my account/i;

async function openSignOffPage(page) {
  await page.goto('/profile', {
    waitUntil: 'domcontentloaded',
  });

  const signOffLink = page
    .getByText('Sign Off', { exact: true })
    .last();

  await expect(signOffLink).toBeVisible();
  await signOffLink.click();

  await expect(getReasonTextarea(page)).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: SIGN_OFF_HEADING,
      exact: true,
    })
  ).toBeVisible();
}

function getReasonTextarea(page) {
  return page.locator('#reasonForLeaving');
}

function getDeletionCheckbox(page) {
  return page.getByRole('checkbox', {
    name: DELETE_CHECKBOX_NAME,
  });
}

function getCancelButton(page) {
  return page
    .getByRole('button', {
      name: 'Cancel',
      exact: true,
    })
    .first();
}

function getSubmitButton(page) {
  return page.getByRole('button', {
    name: 'Submit',
    exact: true,
  });
}

function getCharacterCounter(page) {
  return page.getByText(/^\d+\/500 characters$/);
}

test.describe('Profile - Sign Off', () => {
  test.beforeEach(async ({ page }) => {
    await openSignOffPage(page);
  });

  test('FT-01 - Verify initial state of the Sign Off page', async ({
    page,
  }) => {
    const textarea = getReasonTextarea(page);
    const checkbox = getDeletionCheckbox(page);
    const cancelButton = getCancelButton(page);
    const submitButton = getSubmitButton(page);

    await expect(
      page.getByText('Account Deletion', {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText(
        /This action will permanently delete your account and all associated data/i
      )
    ).toBeVisible();

    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue('');
    await expect(textarea).toHaveAttribute('maxlength', '500');

    await expect(getCharacterCounter(page)).toHaveText(
      '0/500 characters'
    );

    await expect(checkbox).not.toBeChecked();
    await expect(cancelButton).toBeEnabled();
    await expect(submitButton).toBeDisabled();
  });

  test('FT-02 - Checking the acknowledgment checkbox enables Submit', async ({
    page,
  }) => {
    const checkbox = getDeletionCheckbox(page);
    const submitButton = getSubmitButton(page);

    await checkbox.check();

    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();
  });

  test('FT-03 - Unchecking the acknowledgment checkbox disables Submit', async ({
    page,
  }) => {
    const checkbox = getDeletionCheckbox(page);
    const submitButton = getSubmitButton(page);

    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();

    await checkbox.uncheck();

    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();
  });

  test('FT-04 - Cancel resets deletion selection and preserves reason text', async ({
    page,
  }) => {
    const reason = 'I no longer need this account.';
    const textarea = getReasonTextarea(page);
    const checkbox = getDeletionCheckbox(page);
    const submitButton = getSubmitButton(page);

    await textarea.fill(reason);
    await checkbox.check();

    await expect(textarea).toHaveValue(reason);
    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();

    await getCancelButton(page).click();

    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();
    await expect(textarea).toHaveValue(reason);

    await expect(
      page.getByRole('heading', {
        name: SIGN_OFF_HEADING,
        exact: true,
      })
    ).toBeVisible();
  });

  test('BT-01 - Character counter updates dynamically', async ({
    page,
  }) => {
    const tenCharacters = '1234567890';
    const textarea = getReasonTextarea(page);

    await textarea.fill(tenCharacters);

    await expect(textarea).toHaveValue(tenCharacters);
    await expect(getCharacterCounter(page)).toHaveText(
      '10/500 characters'
    );
  });

  test('BT-02 - Textarea accepts exactly 500 characters', async ({
    page,
  }) => {
    const fiveHundredCharacters = 'a'.repeat(500);
    const textarea = getReasonTextarea(page);

    await textarea.fill(fiveHundredCharacters);

    await expect(textarea).toHaveValue(fiveHundredCharacters);
    await expect(getCharacterCounter(page)).toHaveText(
      '500/500 characters'
    );
  });

  test('BT-03 - Textarea blocks input beyond 500 characters', async ({
    page,
  }) => {
    const fiveHundredFiveCharacters = 'a'.repeat(505);
    const expectedValue = 'a'.repeat(500);
    const textarea = getReasonTextarea(page);

    await textarea.fill(fiveHundredFiveCharacters);

    await expect(textarea).toHaveValue(expectedValue);
    await expect(textarea).toHaveAttribute('maxlength', '500');

    await expect(getCharacterCounter(page)).toHaveText(
      '500/500 characters'
    );
  });

  test('BT-04 - Textarea accepts special characters and emojis safely', async ({
    page,
  }) => {
    const specialText = '!@#$%^&*()_+ Test 😀 🚀';
    const textarea = getReasonTextarea(page);

    await textarea.fill(specialText);

    await expect(textarea).toHaveValue(specialText);

    await expect(
      page.getByText(
        'An error occurred while deleting your account. Please try again.',
        { exact: true }
      )
    ).not.toBeVisible();
  });

  test('ST-02 - Submit opens the final account deletion confirmation modal', async ({
    page,
  }) => {
    const checkbox = getDeletionCheckbox(page);
    const submitButton = getSubmitButton(page);

    await checkbox.check();

    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    const modalHeading = page.getByText(
      'Confirm Account Deletion',
      { exact: true }
    );

    await expect(modalHeading).toBeVisible();

    await expect(
      page.getByText(
        /Are you absolutely sure you want to delete your account/i
      )
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Delete Account',
        exact: true,
      })
    ).toBeVisible();

    const modalCancelButton = page
      .getByRole('button', {
        name: 'Cancel',
        exact: true,
      })
      .last();

    await expect(modalCancelButton).toBeVisible();
    await modalCancelButton.click();

    await expect(modalHeading).not.toBeVisible();

    await expect(
      page.getByRole('heading', {
        name: SIGN_OFF_HEADING,
        exact: true,
      })
    ).toBeVisible();
  });
});