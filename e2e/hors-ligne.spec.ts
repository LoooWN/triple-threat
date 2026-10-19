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
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  await page.reload()
  await expect(page.getByText('2 étapes, demi-terrain')).toBeVisible()

  // Export, suppression, réimport.
  const telechargement = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Options de Test avion' }).click()
  await page.getByRole('button', { name: 'Exporter ce système' }).click()
  const fichier = await (await telechargement).path()
  const json = JSON.parse(await readFile(fichier, 'utf8'))
  expect(json).toMatchObject({ format: 'triple-threat', version: 2 })
  expect(json.systemes[0].etapes).toHaveLength(2)

  await page.getByRole('button', { name: 'Options de Test avion' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun système pour l’instant.', { exact: false })).toBeVisible()

  await page.locator('input[type=file]').setInputFiles(fichier)
  await expect(page.getByText('Importé : 1 système.')).toBeVisible()
  await expect(page.getByText('2 étapes, demi-terrain')).toBeVisible()
})

test('bibliothèque et effectif : maillots sur le terrain, catégories et recherche', async ({ page }) => {
  page.on('dialog', (d) => d.accept(d.message().includes('équipe') ? 'U15 F' : undefined))
  await passerEnModeAvion(page)

  // Effectif : une équipe avec deux joueuses.
  await page.getByRole('tab', { name: 'Effectif' }).click()
  await page.getByRole('button', { name: 'Nouvelle équipe' }).click()
  const equipe = page.getByRole('region', { name: 'U15 F' })
  for (const [maillot, nom] of [['00', 'Léa'], ['7', 'Inès']]) {
    await equipe.getByRole('button', { name: 'Ajouter un joueur' }).click()
    await equipe.getByLabel('Numéro de maillot').last().fill(maillot)
    await equipe.getByLabel('Prénom').last().fill(nom)
  }

  // Deux systèmes dans deux catégories.
  await page.getByRole('tab', { name: 'Systèmes' }).click()
  for (const [nom, categorie] of [['Zone presse', 'Défense'], ['Corne', 'Attaque']]) {
    await page.getByRole('button', { name: 'Nouveau système' }).click()
    await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill(nom)
    await page.getByRole('button', { name: categorie, exact: true }).click()
    await page.getByRole('button', { name: 'Créer' }).click()
    if (nom === 'Corne') break
    await page.getByRole('button', { name: 'Bibliothèque' }).click()
  }

  // Dans « Corne » : équipe U15 F, le pion 1 porte le maillot 00 de Léa.
  await toucher(page, 9, 7.5)
  await page.getByRole('button', { name: 'Plus' }).click()
  await page.getByRole('button', { name: 'Équipe (maillots)…' }).click()
  await page.getByRole('button', { name: 'U15 F' }).click()
  await toucher(page, 9, 7.5)
  await page.getByRole('group', { name: 'Maillot' }).getByRole('button', { name: /00\s*Léa/ }).click()
  await expect(page.locator('.joueur.attaque text').first()).toHaveText('00')
  await expect(page.locator('.joueur .nom')).toHaveText('Léa')

  // Retour : rangé par catégorie, filtre et recherche sans accents.
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  await expect(page.getByRole('heading', { name: 'Défense' })).toBeVisible()
  await page.getByRole('group', { name: 'Catégories' }).getByRole('button', { name: 'Défense' }).click()
  await expect(page.locator('.carte strong')).toHaveText(['Zone presse'])
  await page.getByRole('group', { name: 'Catégories' }).getByRole('button', { name: 'Toutes' }).click()
  await page.getByLabel('Rechercher').fill('defense')
  await expect(page.locator('.carte strong')).toHaveText(['Zone presse'])
  await page.getByLabel('Rechercher').fill('')

  // Variante.
  await page.getByRole('button', { name: 'Options de Corne' }).click()
  await page.getByRole('button', { name: 'Dupliquer en variante' }).click()
  await expect(page.getByText('Corne – variante', { exact: true })).toBeVisible()
})

test('les systèmes enregistrés par la version 1 sont repris sans perte', async ({ page }) => {
  await passerEnModeAvion(page)
  // Écrit un système au format de la phase 1 directement dans le stockage de l'iPad.
  await page.evaluate(() => new Promise<void>((ok, ko) => {
    const ouverture = indexedDB.open('triple-threat')
    ouverture.onsuccess = () => {
      const tx = ouverture.result.transaction('systemes', 'readwrite')
      tx.objectStore('systemes').put({
        id: 's-ancien', nom: 'Ancien système', creeLe: '2026-10-19T10:00:00Z', modifieLe: '2026-10-19T10:00:00Z',
        terrain: { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 },
        etapes: [{ id: 'e1', description: 'entrée', ballon: 'A1', actions: [], textes: [],
          joueurs: [{ id: 'A1', camp: 'attaque', numero: 1, x: 9, y: 7.5 }] }],
      }, 's-ancien')
      tx.oncomplete = () => ok()
      tx.onerror = () => ko(tx.error)
    }
    ouverture.onerror = () => ko(ouverture.error)
  }))
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Attaque' })).toBeVisible()
  await page.getByRole('button', { name: 'Ouvrir Ancien système' }).click()
  await expect(page.locator('.joueur.attaque')).toHaveCount(1)
  await expect(page.locator('.ballon')).toHaveCount(1)
  await expect(page.getByPlaceholder('Ce qui se passe à cette étape…')).toHaveValue('entrée')
})
