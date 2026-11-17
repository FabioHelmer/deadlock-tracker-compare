import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  use: {
    baseURL: 'http://127.0.0.1:4175/deadlock-tracker-compare/',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4175',
    url: 'http://127.0.0.1:4175/deadlock-tracker-compare/',
    reuseExistingServer: !process.env.CI,
  },
})
