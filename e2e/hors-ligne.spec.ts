import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

// Première visite en ligne (installation), puis tout le reste en mode avion.
async function passerEnModeAvion(page: Page) {
  await page.goto('./')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.context().setOffline(true)
  await page.reload()
}

// Mètres du terrain (demi-terrain) → pixels à l'écran.
const ecran = (page: Page, x: number, y: number) =>
  page.locator('.zone-terrain svg').evaluate((el: SVGSVGElement, [x, y]) => {
    const p = new DOMPoint(y + 1.2, x + 1.2).matrixTransform(el.getScreenCTM()!)
    return [p.x, p.y] as const
  }, [x, y])

async function toucher(page: Page, x: number, y: number) {
  const [a, b] = await ecran(page, x, y)
  await page.mouse.click(a, b)
}

async function tracer(page: Page, pts: [number, number][]) {
  const [a, b] = await ecran(page, ...pts[0])
  await page.mouse.move(a, b)
  await page.mouse.down()
  for (const [x, y] of pts.slice(1)) {
    const [c, d] = await ecran(page, x, y)
    await page.mouse.move(c, d, { steps: 8 })
  }
  await page.mouse.up()
}

// Position à l'écran de l'attaquant qui porte ce numéro.
const position = (page: Page, numero: string) =>
  page.locator('.joueur.attaque').filter({ hasText: new RegExp(`^${numero}$`) }).getAttribute('transform')

test('s’ouvre en mode avion après la première visite, sans rien charger d’internet', async ({ page }) => {
  const externes: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173/')) externes.push(r.url()) })
  await passerEnModeAvion(page)
  await expect(page.getByRole('heading', { name: 'Triple Threat' })).toBeVisible()
  expect(externes).toEqual([])
})

test('crée un système complet en mode avion, le retrouve, l’exporte et le réimporte', async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  // Force le téléchargement (la feuille de partage ne s'automatise pas).
  await page.addInitScript(() => { Object.defineProperty(navigator, 'canShare', { value: undefined }) })
  await passerEnModeAvion(page)

  await page.getByRole('button', { name: 'Nouveau système' }).click()
  await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill('Test avion')
  await page.getByRole('button', { name: 'Créer' }).click()

  for (const [x, y] of [[9, 7.5], [5.5, 1.8], [5.5, 13.2], [5.8, 5.05], [5.8, 9.95]] as const) await toucher(page, x, y)
  await expect(page.locator('.joueur.attaque')).toHaveCount(5)
  await toucher(page, 9, 7.5)
  await page.getByRole('button', { name: 'Donner le ballon' }).click()
  await expect(page.locator('.ballon')).toHaveCount(1)

  await page.getByRole('button', { name: 'Dessiner' }).click()
  await tracer(page, [[5.5, 1.8], [4, 2.5], [2.5, 3.5]])
  await page.getByRole('button', { name: 'Coupe' }).click()
  await tracer(page, [[9, 7.5], [6, 4.5], [2.6, 3.4]])
  await page.getByRole('button', { name: 'Passe' }).click()
  await expect(page.locator('.action')).toHaveCount(2)

  // Un trait qui ne part d'aucun joueur est refusé avec un message.
  await tracer(page, [[12, 12], [11, 11], [10, 10]])
  await expect(page.getByText('Commence le trait sur un joueur.')).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter l’étape suivante' }).click()
  await expect(page.locator('.action')).toHaveCount(0)
  // Le 2 est au bout de sa coupe (x 2,5 ; y 3,5) → dessin à l'écran (y + 1,2 ; x + 1,2), et il a le ballon.
  const [sx, sy] = (await position(page, '2'))!.match(/-?[\d.]+/g)!.map(Number)
  expect(Math.abs(sx - 4.7)).toBeLessThan(0.1)
  expect(Math.abs(sy - 3.7)).toBeLessThan(0.1)
  const ballon = async () => (await page.locator('.ballon').getAttribute('transform'))!.match(/-?[\d.]+/g)!.map(Number)
  expect(Math.abs((await ballon())[0] - 0.36 - sx)).toBeLessThan(0.1)

  // Toucher un autre joueur par erreur ouvre ses options sans lui donner le ballon.
  await page.getByRole('button', { name: 'Placer' }).click()
  await toucher(page, 9, 7.5)
  await expect(page.getByRole('button', { name: 'Donner le ballon' })).toBeVisible()
  await page.mouse.click(5, 5)
  expect(Math.abs((await ballon())[0] - 0.36 - sx)).toBeLessThan(0.1)

  // Changer le numéro du 2 en 4 : l'ancien 4 (au coude, x 5,8 ; y 5,05) devient 2, dans toutes les étapes.
  const proche = async (numero: string, x: number, y: number) => {
    const [a, b] = (await position(page, numero))!.match(/-?[\d.]+/g)!.map(Number)
    return Math.abs(a - x) < 0.1 && Math.abs(b - y) < 0.1
  }
  await toucher(page, 2.5, 3.5)
  await page.getByRole('group', { name: 'Numéro' }).getByRole('button', { name: '4' }).click()
  expect(await proche('4', sx, sy)).toBe(true)
  await page.getByRole('tab', { name: '1' }).click()
  expect(await proche('2', 5.05 + 1.2, 5.8 + 1.2)).toBe(true)
  await page.getByRole('tab', { name: '2' }).click()

  // Rechargement toujours hors ligne : le système est là.
  await page.getByRole('button', { name: 'Mes systèmes' }).click()
  await page.reload()
  await expect(page.getByText('2 étapes, demi-terrain')).toBeVisible()

  // Export, suppression, réimport.
  const telechargement = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Options de Test avion' }).click()
  await page.getByRole('button', { name: 'Exporter ce système' }).click()
  const fichier = await (await telechargement).path()
  const json = JSON.parse(await readFile(fichier, 'utf8'))
  expect(json).toMatchObject({ format: 'triple-threat', version: 1 })
  expect(json.systemes[0].etapes).toHaveLength(2)

  await page.getByRole('button', { name: 'Options de Test avion' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun système pour l’instant.', { exact: false })).toBeVisible()

  await page.locator('input[type=file]').setInputFiles(fichier)
  await expect(page.getByText('1 système importé.')).toBeVisible()
  await expect(page.getByText('2 étapes, demi-terrain')).toBeVisible()
})
