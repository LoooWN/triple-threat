import { expect, test } from '@playwright/test'

test('s’ouvre en mode avion après la première visite, sans rien charger d’internet', async ({ page, context }) => {
  const externes: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173/')) externes.push(r.url()) })

  await page.goto('./')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Triple Threat' })).toBeVisible()
  expect(externes).toEqual([])
})
