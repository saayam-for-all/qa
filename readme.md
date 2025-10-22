
Pulling from GitHub

To pull the latest changes from the GitHub repository, use the following command:

```bash
git pull origin {brnach_name}
```

This will fetch and integrate changes from the remote repository to your local repository.

Installation

To install Playwright, you can use the following command:

```bash
npm install playwright
```

This will install Playwright and its necessary dependencies.

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
