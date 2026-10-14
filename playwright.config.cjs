const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  timeout: 60000,

  expect: {
    timeout: 10000,
  },

  retries: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'https://test-saayam.netlify.app',
    trace: 'on-first-retry',
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    {
      name: 'pixel-5',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'iphone-16-pro',
      use: {
        ...devices['iPhone 16 Pro'],
      },
    },

    {
      name: 'mobile-firefox',
      use: {
        browserName: 'firefox',
        viewport: {
          width: 390,
          height: 844,
        },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
