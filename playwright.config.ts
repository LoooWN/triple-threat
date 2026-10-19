import { defineConfig, devices } from '@playwright/test'

const url = 'http://localhost:4173/triple-threat/'

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: url },
  projects: [
    // Format d'un iPad classique en paysage, au doigt.
    { name: 'ipad', use: { ...devices['Desktop Chrome'], viewport: { width: 1180, height: 820 }, hasTouch: true } },
    // Moteur de Safari (WebKit), dans une fenêtre d'iPad plus petite.
    { name: 'ipad-safari', use: { ...devices['iPad (gen 11) landscape'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url,
    timeout: 180_000,
  },
})
