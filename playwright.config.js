// Playwright configuration for qx-typed-basecoat-ui
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/playwright',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:8080',
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx http-server -p 8080 . -c-1',
    port: 8080,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
