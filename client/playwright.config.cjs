const { defineConfig, devices } = require('@playwright/test');

if (process.env.PLAYWRIGHT_ISOLATED_E2E !== '1') {
  throw new Error(
    'Playwright E2E tests must run against the isolated E2E stack. Use ./run-e2e.sh instead of invoking Playwright directly.'
  );
}

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/usr/bin/chromium-browser',
        },
      },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      PLAYWRIGHT_ISOLATED_E2E: '1',
      VITE_API_PROXY_TARGET: 'http://api-e2e:3000',
    },
  },
});
