const { test, expect } = require('@playwright/test');
const crypto = require('crypto');

// Issue #69 — Mocked LinkedIn OAuth login, per Nirupama's plan.
const COGNITO_DOMAIN = 'saayamforall-qauserpool.auth.us-east-1.amazoncognito.com';
const USER_POOL_CLIENT_ID = '433qjfh10rhfb201cav0pdb8mk';
const USER_POOL_ID = 'us-east-1_hzvIMnDNi';
const REGION = 'us-east-1';
const REDIRECT_URI = 'https://idptest-saayam.netlify.app/dashboard';
const FAKE_KEY_ID = 'fake-test-key-1';

const base64url = (input) => {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(JSON.stringify(input));
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function generateTestKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

function buildSignedIdToken({ email, sub, privateKey }) {
  const header = { alg: 'RS256', typ: 'JWT', kid: FAKE_KEY_ID };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub,
    email,
    email_verified: true,
    token_use: 'id',
    'cognito:username': `LinkedIn_${sub}`,
    identities: [
      { userId: sub, providerName: 'LinkedIn', providerType: 'LinkedIn', issuer: null, primary: 'true', dateCreated: String(Date.now()) },
    ],
    aud: USER_POOL_CLIENT_ID,
    iss: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    iat: now,
    exp: now + 3600,
    auth_time: now,
  };
  const signingInput = `${base64url(header)}.${base64url(payload)}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

// Sets up all the mocked routes needed for one login attempt, then clicks
// through the flow. Returns the final URL reached. Call it twice with the
// SAME email/sub to check the flow behaves consistently on a repeat login —
// see the note above about what this does and doesn't prove.
async function performMockedLinkedInLogin(page, { email, sub, authCode }) {
  const { publicKey, privateKey } = generateTestKeyPair();

  await page.route(
    `**://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
    (route) => {
      const jwk = crypto.createPublicKey(publicKey).export({ format: 'jwk' });
      jwk.kid = FAKE_KEY_ID;
      jwk.use = 'sig';
      jwk.alg = 'RS256';
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ keys: [jwk] }) });
    }
  );

  await page.route(`**://${COGNITO_DOMAIN}/oauth2/authorize**`, (route) => {
    const url = new URL(route.request().url());
    const state = url.searchParams.get('state');
    const redirectBack = new URL(REDIRECT_URI);
    redirectBack.searchParams.set('code', authCode);
    if (state) redirectBack.searchParams.set('state', state);

    // WebKit's route.fulfill() can't fulfill with an HTTP redirect status
    // (302) — Chromium and Firefox allow it, WebKit doesn't. A tiny
    // self-redirecting HTML page works identically on all 6 browsers.
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<script>window.location.replace(${JSON.stringify(redirectBack.toString())});</script>`,
    });
  });

  await page.route(`**://${COGNITO_DOMAIN}/oauth2/token`, (route) => {
    const idToken = buildSignedIdToken({ email, sub, privateKey });
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id_token: idToken,
        access_token: idToken,
        refresh_token: 'FAKE_REFRESH_TOKEN',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    });
  });

  await page.route(`**://cognito-idp.${REGION}.amazonaws.com/`, (route) => {
    const target = route.request().headers()['x-amz-target'] || '';
    if (target.includes('GetUser')) {
      route.fulfill({
        status: 200,
        contentType: 'application/x-amz-json-1.1',
        body: JSON.stringify({
          Username: `LinkedIn_${sub}`,
          UserAttributes: [
            { Name: 'sub', Value: sub },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'email', Value: email },
            { Name: 'identities', Value: JSON.stringify([{ userId: sub, providerName: 'LinkedIn', providerType: 'LinkedIn', primary: 'true' }]) },
          ],
        }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto('https://idptest-saayam.netlify.app/login');
  await page.getByRole('button', { name: 'LinkedIn', exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  return page.url();
}

test.describe('Mocked LinkedIn OAuth login - Issue #69', () => {
  test('TC-LN-MOCK-01: New LinkedIn user reaches the dashboard', async ({ page }) => {
    const finalUrl = await performMockedLinkedInLogin(page, {
      email: `newuser+${Date.now()}@example.com`,
      sub: `fake-sub-${Date.now()}`,
      authCode: 'FAKE_AUTH_CODE_NEW_USER',
    });
    expect(finalUrl).toContain('/dashboard');
  });

  // NOTE ON SCOPE: this confirms the LOGIN FLOW behaves consistently when
  // run twice with the identical LinkedIn identity — it reaches the
  // dashboard both times without errors. It does NOT confirm the backend
  // treats this as the same account rather than a duplicate — that check
  // (getUserIdByEmail) lives in Saayam's real backend, which this mock
  // does not reach (it's rejected with 401, since our token isn't real).
  // Confirming true duplicate-prevention needs backend test data/support.
  test('TC-LN-MOCK-02: Repeating login with the same LinkedIn identity behaves consistently', async ({ page, context }) => {
    const sharedEmail = `returning+${Date.now()}@example.com`;
    const sharedSub = `fake-sub-returning-${Date.now()}`;

    const firstUrl = await performMockedLinkedInLogin(page, {
      email: sharedEmail,
      sub: sharedSub,
      authCode: 'FAKE_AUTH_CODE_FIRST_LOGIN',
    });
    expect(firstUrl).toContain('/dashboard');

    // Fresh page/context to simulate a separate login session, same identity.
    const page2 = await context.newPage();
    const secondUrl = await performMockedLinkedInLogin(page2, {
      email: sharedEmail,
      sub: sharedSub,
      authCode: 'FAKE_AUTH_CODE_SECOND_LOGIN',
    });
    expect(secondUrl).toContain('/dashboard');
  });
});