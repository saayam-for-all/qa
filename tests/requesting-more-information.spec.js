const { test, expect } = require('@playwright/test');

const QUESTION_INPUT = /Ask a follow-up question/i;

async function login(page) {
  const email = process.env.SAAYAM_EMAIL;
  const password = process.env.SAAYAM_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SAAYAM_EMAIL and SAAYAM_PASSWORD environment variables are required.'
    );
  }

  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await page
    .getByRole('button', { name: 'Log In', exact: true })
    .last()
    .click();

  await page.waitForURL(
    url => !url.pathname.includes('/login'),
    { timeout: 60000 }
  );
}

async function openRequest(page) {
  await page.goto('/dashboard');

  await expect(
    page.getByRole('button', { name: 'Profile' })
  ).toBeVisible({ timeout: 30000 });

  const requestLink = page.locator('a[href*="/request/"]').first();

  await expect(requestLink).toBeVisible({ timeout: 30000 });
  await requestLink.click();

  await expect(page).toHaveURL(/\/request\//);

  await expect(
    page.getByRole('heading', {
      name: 'Request Details',
    })
  ).toBeVisible({ timeout: 30000 });
}

function getAIChatButton(page) {
  return page
    .locator('button')
    .filter({ hasText: 'AI Chat' })
    .first();
}

async function openAIChat(page) {
  const aiChatButton = getAIChatButton(page);

  await expect(aiChatButton).toBeVisible({
    timeout: 30000,
  });

  await aiChatButton.click();

  await expect(
    page.getByRole('heading', {
      name: 'AI Chat',
      exact: true,
    })
  ).toBeVisible({
    timeout: 30000,
  });

  await expect(
    page.getByPlaceholder(QUESTION_INPUT)
  ).toBeVisible({
    timeout: 30000,
  });
}

async function mockSuccessfulAI(page) {
  await page.route('**/v1/genai/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'Mock AI response for this request.',
      }),
    });
  });
}

async function mockFailedAI(page) {
  await page.route('**/v1/genai/**', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    });
  });
}

async function mockDelayedAI(page, delay = 1500) {
  await page.route('**/v1/genai/**', async route => {
    await new Promise(resolve => setTimeout(resolve, delay));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'Mock AI response for this request.',
      }),
    });
  });
}

function getCounter(page) {
  return page.getByTitle(/questions remaining/i);
}

async function closeAIChat(page) {
  const closeButton = page.getByRole('button', {
    name: /close/i,
  });

  if (await closeButton.count()) {
    await closeButton.first().click();
    return;
  }

  const xButton = page.locator('button').filter({
    hasText: '×',
  });

  await xButton.first().click();
}

test.describe('Request Details - AI Chat / More Information', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openRequest(page);
  });

  test(
    'TC-MI-001: AI Chat opens with five questions remaining',
    async ({ page }) => {
      await mockSuccessfulAI(page);

      const aiChatButton = getAIChatButton(page);

      await expect(aiChatButton).toBeVisible({
        timeout: 30000,
      });

      await aiChatButton.click();

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeVisible({
        timeout: 30000,
      });

      await expect(
        page.getByPlaceholder(QUESTION_INPUT)
      ).toBeVisible({
        timeout: 30000,
      });

      await expect(getCounter(page)).toHaveText('5');

      await expect(getCounter(page)).toHaveAttribute(
        'title',
        /5 questions remaining/i
      );
    }
  );

  test(
    'TC-MI-002: Empty and whitespace questions cannot be submitted',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);
      const send = page.getByRole('button', { name: /send/i });

      await expect(input).toHaveValue('');
      await expect(send).toBeDisabled();
      await expect(getCounter(page)).toHaveText('5');

      await input.fill('   ');

      await expect(send).toBeDisabled();
      await expect(getCounter(page)).toHaveText('5');
    }
  );

  test(
    'TC-MI-003: Input enforces 250 character maximum',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await input.fill('a'.repeat(300));

      const value = await input.inputValue();

      expect(value.length).toBe(250);
    }
  );

  test(
    'TC-MI-004: Shift+Enter inserts newline without submitting',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await expect(getCounter(page)).toHaveText('5');

      await input.fill(
        'Who is the beneficiary of this request?'
      );

      await input.press('Shift+Enter');

      await expect(input).toHaveValue(
        'Who is the beneficiary of this request?\n'
      );

      await expect(getCounter(page)).toHaveText('5');
    }
  );

  test(
    'TC-MI-005: Enter submits a valid question',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await input.fill(
        'Who is the beneficiary of this request?'
      );

      await input.press('Enter');

      await expect(
        page.getByText(
          'Who is the beneficiary of this request?',
          { exact: true }
        )
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-006: Successful answer consumes exactly one question',
    async ({ page }) => {
      let initialResponse = null;

      page.on('response', async response => {
        if (
          response
            .url()
            .includes('/v1/genai/generate_answer_api')
        ) {
          try {
            const json = await response.json();

            if (
              json &&
              json.statusCode !== undefined
            ) {
              initialResponse = json;
            }
          } catch {}
        }
      });

      await openAIChat(page);
      await page.waitForTimeout(3000);

      if (
        initialResponse &&
        Number(initialResponse.statusCode) >= 400
      ) {
        const message =
          initialResponse.body?.error ||
          initialResponse.error ||
          'Unknown GenAI backend error';

        throw new Error(
          `BLOCKED: Successful-answer counter behavior cannot be validated because the live GenAI backend returned application status ${initialResponse.statusCode}: ${message}`
        );
      }

      await expect(getCounter(page)).toHaveText('5');

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await input.fill('What is this request about?');

      const responsePromise = page.waitForResponse(
        response =>
          response
            .url()
            .includes('/v1/genai/generate_answer_api') &&
          response.request().method() === 'POST',
        { timeout: 30000 }
      );

      await input.press('Enter');

      const response = await responsePromise;

      let responseBody = null;

      try {
        responseBody = await response.json();
      } catch {
        throw new Error(
          'BLOCKED: GenAI follow-up response was not valid JSON.'
        );
      }

      if (
        responseBody &&
        Number(responseBody.statusCode) >= 400
      ) {
        const message =
          responseBody.body?.error ||
          responseBody.error ||
          'Unknown GenAI backend error';

        throw new Error(
          `BLOCKED: Successful-answer counter behavior cannot be validated because the live GenAI backend returned application status ${responseBody.statusCode}: ${message}`
        );
      }

      await expect(getCounter(page)).toHaveText('4');
    }
  );

  test(
    'TC-MI-007: Failed AI request must not consume a question',
    async ({ page }) => {
      await mockFailedAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await expect(getCounter(page)).toHaveText('5');

      await input.fill(
        'What help is needed for this request?'
      );

      await input.press('Enter');
      await page.waitForTimeout(2000);

      await expect(getCounter(page)).toHaveText('5');
    }
  );

  test(
    'TC-MI-008: Failed AI request displays user-friendly error or retry state',
    async ({ page }) => {
      await mockFailedAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await input.fill(
        'What help is needed for this request?'
      );

      await input.press('Enter');

      const errorMessages = page.getByText(
        /error occurred|unable|failed|try again|retry/i
      );

      await expect(
        errorMessages.first()
      ).toBeVisible({ timeout: 15000 });

      expect(
        await errorMessages.count()
      ).toBeGreaterThan(0);

      await expect(
        page.getByText(/500|internal server error/i)
      ).toHaveCount(0);
    }
  );

  test(
    'TC-MI-009: Rapid double Send creates only one submission',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);
      const send = page.getByRole('button', { name: /send/i });

      await input.fill('What is this request about?');

      await send.dblclick();

      await expect(
        page.getByText(
          'What is this request about?',
          { exact: true }
        )
      ).toHaveCount(1);

      await expect(getCounter(page)).toHaveText('4');
    }
  );

  test(
    'TC-MI-010: Closing and reopening preserves remaining question count',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      await input.fill('Question one');
      await input.press('Enter');

      await expect(getCounter(page)).toHaveText('4');

      await closeAIChat(page);

      const aiChatButton = getAIChatButton(page);

      await expect(aiChatButton).toBeVisible({
        timeout: 30000,
      });

      await aiChatButton.click();

      await expect(
        page.getByText(/reached the question limit/i)
      ).toHaveCount(0);

      await expect(getCounter(page)).toHaveText('4');
    }
  );

  test(
    'TC-MI-011: Closing without using a question must not trigger cooldown',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      await expect(getCounter(page)).toHaveText('5');

      await closeAIChat(page);

      const aiChatButton = getAIChatButton(page);

      await expect(aiChatButton).toBeVisible({
        timeout: 30000,
      });

      await aiChatButton.click();

      await expect(
        page.getByText(/reached the question limit/i)
      ).toHaveCount(0);

      await expect(getCounter(page)).toHaveText('5');
    }
  );

  test(
    'TC-MI-012: Comments Volunteers and Details tabs continue working',
    async ({ page }) => {
      await page
        .getByText('Volunteers', { exact: true })
        .click();

      await expect(
        page.getByText(/Volunteer Management/i)
      ).toBeVisible();

      await page
        .getByText('Details', { exact: true })
        .click();

      await expect(
        page.getByText(/Additional Information/i)
      ).toBeVisible();

      await page
        .getByText('Comments', { exact: true })
        .click();

      await expect(
        page.getByPlaceholder(/Write a comment/i)
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-013: Request Details survives page refresh',
    async ({ page }) => {
      const currentURL = page.url();

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(currentURL);

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible({ timeout: 30000 });

      await page.screenshot({
        path: 'tc-mi-013-after-refresh.png',
        fullPage: true,
      });

      console.log(
        'URL after refresh:',
        page.url()
      );

      console.log(
        'AI Chat DOM text count:',
        await page.getByText('AI Chat', { exact: true }).count()
      );

      console.log(
        'Button count:',
        await page.locator('button').count()
      );

      await expect(
        getAIChatButton(page)
      ).toBeVisible({ timeout: 30000 });

      await expect(
        page.getByText('Comments', { exact: true })
      ).toBeVisible();

      await expect(
        page.getByText('Volunteers', { exact: true })
      ).toBeVisible();

      await expect(
        page.getByText('Details', { exact: true })
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-014: AI Chat is keyboard reachable',
    async ({ page }) => {
      const aiChat = getAIChatButton(page);

      await expect(aiChat).toBeVisible({
        timeout: 30000,
      });

      await page.locator('body').click({
        position: { x: 5, y: 5 },
      });

      let reachedAIChat = false;

      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');

        const focused = await aiChat.evaluate(
          element => document.activeElement === element
        );

        if (focused) {
          reachedAIChat = true;
          break;
        }
      }

      expect(reachedAIChat).toBe(true);
    }
  );

  test(
    'TC-MI-015: Request Details is responsive at 320px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 320,
        height: 750,
      });

      await page.reload();

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible({ timeout: 30000 });

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );

      expect(overflow).toBe(false);
    }
  );

  test(
    'TC-MI-016: Request Details is responsive at 768px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 768,
        height: 750,
      });

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible();

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );

      expect(overflow).toBe(false);
    }
  );

  test(
    'TC-MI-017: Request Details is responsive at 1024px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 1024,
        height: 750,
      });

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible();

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );

      expect(overflow).toBe(false);
    }
  );

  test(
    'TC-MI-018: Request Details is responsive at 1440px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 1440,
        height: 750,
      });

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible();

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );

      expect(overflow).toBe(false);
    }
  );

  test(
    'TC-MI-019: Send is disabled while AI request is in flight',
    async ({ page }) => {
      await mockDelayedAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);
      const send = page.getByRole('button', { name: /send/i });

      await input.fill('What is this request about?');
      await send.click();

      await expect(send).toBeDisabled();
      await expect(input).toBeDisabled();
    }
  );

  test(
    'TC-MI-020: Only one AI request is sent during rapid submission',
    async ({ page }) => {
      let followUpRequests = 0;

      await page.route('**/v1/genai/**', async route => {
        const request = route.request();

        if (request.method() === 'POST') {
          let body = null;

          try {
            body = request.postDataJSON();
          } catch {}

          if (
            body &&
            Array.isArray(body.conversation_history) &&
            body.conversation_history.length > 0
          ) {
            followUpRequests++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            answer: 'Mock AI response for this request.',
          }),
        });
      });

      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);
      const send = page.getByRole('button', { name: /send/i });

      await input.fill(
        'Tell me more about this request.'
      );

      await send.dblclick();

      await page.waitForTimeout(2000);

      expect(followUpRequests).toBe(1);
    }
  );

  test(
    'TC-MI-021: Escape closes AI Chat',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      await page.keyboard.press('Escape');

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeHidden();
    }
  );

  test(
    'TC-MI-022: Focus returns to AI Chat control after closing modal',
    async ({ page }) => {
      await mockSuccessfulAI(page);

      const aiChatButton = getAIChatButton(page);

      await expect(aiChatButton).toBeVisible({
        timeout: 30000,
      });

      await aiChatButton.focus();
      await aiChatButton.press('Enter');

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(aiChatButton).toBeFocused();
    }
  );

  test(
    'TC-MI-023: AI Chat modal is usable at 320px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 320,
        height: 750,
      });

      await page.reload();

      await expect(
        page.getByRole('heading', {
          name: 'Request Details',
        })
      ).toBeVisible({ timeout: 30000 });

      const aiChatButton = getAIChatButton(page);

      await expect(aiChatButton).toBeVisible({
        timeout: 30000,
      });

      await mockSuccessfulAI(page);

      await aiChatButton.click();

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByPlaceholder(QUESTION_INPUT)
      ).toBeVisible();

      await expect(
        page.getByRole('button', { name: /send/i })
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-024: AI Chat modal is usable at 768px',
    async ({ browser }) => {
      const context = await browser.newContext({
        viewport: {
          width: 768,
          height: 750,
        },
      });

      const page = await context.newPage();

      try {
        await login(page);
        await openRequest(page);
        await mockSuccessfulAI(page);

        const aiChatButton = getAIChatButton(page);

        await expect(aiChatButton).toBeVisible({
          timeout: 30000,
        });

        await aiChatButton.click();

        await expect(
          page.getByRole('heading', {
            name: 'AI Chat',
            exact: true,
          })
        ).toBeVisible();

        await expect(
          page.getByPlaceholder(QUESTION_INPUT)
        ).toBeVisible();

        await expect(
          page.getByRole('button', {
            name: /send/i,
          })
        ).toBeVisible();
      } finally {
        await context.close();
      }
    }
  );

  test(
    'TC-MI-025: AI Chat modal is usable at 1024px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 1024,
        height: 750,
      });

      await mockSuccessfulAI(page);
      await openAIChat(page);

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByPlaceholder(QUESTION_INPUT)
      ).toBeVisible();

      await expect(
        page.getByRole('button', { name: /send/i })
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-026: AI Chat modal is usable at 1440px',
    async ({ page }) => {
      await page.setViewportSize({
        width: 1440,
        height: 750,
      });

      await mockSuccessfulAI(page);
      await openAIChat(page);

      await expect(
        page.getByRole('heading', {
          name: 'AI Chat',
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByPlaceholder(QUESTION_INPUT)
      ).toBeVisible();

      await expect(
        page.getByRole('button', { name: /send/i })
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-027: Special characters are accepted without altering input',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const input = page.getByPlaceholder(QUESTION_INPUT);

      const text =
        'Who needs help? @#$%^&*() - "test" / 123';

      await input.fill(text);

      await expect(input).toHaveValue(text);

      await expect(
        page.getByRole('button', { name: /send/i })
      ).toBeEnabled();
    }
  );

  test(
    'TC-MI-028: AI disclaimer is visible',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      await expect(
        page.getByText(
          /AI-generated.*may be inaccurate/i
        )
      ).toBeVisible();
    }
  );

  test(
    'TC-MI-029: Counter exposes remaining question information',
    async ({ page }) => {
      await mockSuccessfulAI(page);
      await openAIChat(page);

      const counter = getCounter(page);

      await expect(counter).toHaveText('5');

      await expect(counter).toHaveAttribute(
        'title',
        /5 questions remaining/i
      );
    }
  );
});