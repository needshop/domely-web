import { defineConfig, devices } from '@playwright/test'

// Les tests tournent sur le build de production (vite preview) : plus rapide et stable que le
// serveur de dev, et sans conflit avec `npm run dev` (port 5174)
const PORT = 4173
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
    // Session du compte de démonstration : les tests des modules démarrent connectés
    // (les tests d'authentification repartent d'un état vide, voir e2e/auth.spec.ts)
    storageState: 'e2e/fixtures/auth-state.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    // Rebuild seulement si les sources ont changé depuis le dernier build (scripts/e2e-server.mjs) ;
    // forcer avec E2E_BUILD=always
    command: 'node scripts/e2e-server.mjs',
    env: { E2E_PORT: String(PORT) },
    url: baseURL,
    // Jamais de serveur déjà ouvert : il pourrait servir un ancien build
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
