import { defineConfig, devices } from '@playwright/test'

const PORT = 5174
const baseURL = `http://localhost:${PORT}`

/**
 * Tests E2E Domely.
 * Navigateur : Google Chrome installé sur la machine (channel "chrome"),
 * le Chromium embarqué de Playwright n'étant pas supporté sur macOS 13.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // Langue par défaut des tests (le détecteur i18next lit la langue du navigateur)
    locale: 'fr-FR',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
