Getting Started

To get started with this project, clone the repository and switch to the E2E testing branch:

```bash
git clone https://github.com/saayam-for-all/qa.git
cd qa
git checkout e2e-playwright-suite
npm install
npx playwright install
```

Installation

The above commands will:
1. Clone the repository from GitHub
2. Switch to the E2E testing branch
3. Install project dependencies (including Playwright)
4. Install Playwright browser binaries

To pull the latest changes from the E2E testing branch, use the following command:

```bash
git pull origin e2e-playwright-suite
```

This will fetch and integrate changes from the remote E2E testing branch to your local repository.

Running Tests

You can run the tests using the command:

```bash
npx playwright test
```

Use the following variations to customize your test run:
- `npx playwright test --ui`: Start the interactive UI mode.
- `npx playwright test --project=chromium`: Run tests only on Desktop Chrome.
- `npx playwright test example`: Run tests in a specific file.
- `npx playwright test --debug`: Run tests in debug mode.

Codegen

To generate tests automatically with Codegen, use:

```bash
npx playwright codegen
```

Optional: Installing the Playwright Extension

For easy access, you can install the Playwright extension in your IDE or VSCode. Search for the Playwright extension in the extensions marketplace and install it. This provides a more integrated environment for running and viewing tests.

Visit the following for more information:
- [Playwright Documentation](https://playwright.dev/docs/intro) ✨
