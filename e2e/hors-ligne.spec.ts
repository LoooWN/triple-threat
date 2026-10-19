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
  await page.getByRole('button', { name: 'Fichier pour un autre iPad' }).click()
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

test('exercice : plus de 5 joueurs, coach, matériel, plusieurs ballons et fiche', async ({ page }) => {
  await passerEnModeAvion(page)
  await page.getByRole('tab', { name: 'Exercices' }).click()
  await page.getByRole('button', { name: 'Nouvel exercice' }).click()
  await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill('Tir en course')
  await page.getByRole('button', { name: 'Tir', exact: true }).click()
  await page.getByRole('button', { name: 'Créer' }).click()

  // 6 attaquants (au-delà de 5 en exercice).
  for (const y of [2, 4, 6, 8, 10, 12]) await toucher(page, 10, y)
  await expect(page.locator('.joueur.attaque')).toHaveCount(6)
  await expect(page.locator('.joueur.attaque text').last()).toHaveText('6')

  // Coach, deux plots et une échelle qu'on tourne.
  await page.getByRole('button', { name: 'Coach' }).click()
  await toucher(page, 3, 12)
  await expect(page.locator('.joueur.coach')).toHaveCount(1)
  await page.getByRole('button', { name: 'Matériel' }).click()
  await toucher(page, 6, 3)
  await toucher(page, 6, 12)
  await page.getByRole('group', { name: 'Matériel' }).getByRole('button', { name: 'Échelle' }).click()
  await toucher(page, 12, 7.5)
  await expect(page.locator('.materiel.plot')).toHaveCount(2)
  await expect(page.locator('.materiel.echelle')).toHaveCount(1)
  const avant = await page.locator('.materiel.echelle path').nth(1).getAttribute('d')
  await toucher(page, 12, 7.5)
  await page.getByRole('button', { name: 'Tourner de 45°' }).click()
  await page.mouse.click(5, 5)
  expect(await page.locator('.materiel.echelle path').nth(1).getAttribute('d')).not.toBe(avant)

  // Deux joueurs avec un ballon chacun, et le coach qui reçoit une passe.
  await page.getByRole('button', { name: 'Placer' }).click()
  for (const y of [2, 4]) {
    await toucher(page, 10, y)
    await page.getByRole('button', { name: 'Donner un ballon' }).click()
  }
  await expect(page.locator('.ballon')).toHaveCount(2)
  await page.getByRole('button', { name: 'Dessiner' }).click()
  await tracer(page, [[10, 2], [7, 6], [3.2, 11.6]])
  await page.getByRole('button', { name: 'Passe' }).click()
  await page.getByRole('button', { name: 'Ajouter l’étape suivante' }).click()
  await expect(page.locator('.ballon')).toHaveCount(2)

  // Fiche de l'exercice.
  await page.getByRole('button', { name: 'Fiche' }).click()
  await page.getByLabel('Mise en place').fill('2 colonnes aux ailes, un ballon par colonne.')
  await page.getByLabel('Points clés').fill('Deux appuis, main extérieure.')
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByLabel('Rechercher').fill('main exterieure')
  await expect(page.locator('.carte strong')).toHaveText(['Tir en course'])
})

test('séance : enchaîner des blocs, puis la présenter avec le minuteur', async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await passerEnModeAvion(page)
  // Un exercice (durée conseillée 12 min) et un système.
  await page.getByRole('tab', { name: 'Exercices' }).click()
  await page.getByRole('button', { name: 'Nouvel exercice' }).click()
  await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill('Échauffement 3 lignes')
  await page.getByRole('button', { name: 'Créer' }).click()
  await page.getByRole('button', { name: 'Fiche' }).click()
  await page.getByLabel('Points clés').fill('Passes à deux mains, appels.')
  await page.getByLabel('Durée conseillée').fill('12')
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('tab', { name: 'Systèmes' }).click()
  for (const nom of ['Corne', 'À supprimer']) {
    await page.getByRole('button', { name: 'Nouveau système' }).click()
    await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill(nom)
    await page.getByRole('button', { name: 'Créer' }).click()
    await page.getByRole('button', { name: 'Bibliothèque' }).click()
  }

  // La séance.
  await page.getByRole('tab', { name: 'Séances' }).click()
  await page.getByRole('button', { name: 'Nouvelle séance' }).click()
  await page.getByLabel('Nom de la séance').fill('Mardi U15')
  for (const [genre, nom] of [['Exercices', 'Échauffement 3 lignes'], ['Systèmes', 'Corne'], ['Systèmes', 'À supprimer']]) {
    await page.getByRole('button', { name: 'Ajouter un exercice ou un système' }).click()
    await page.getByRole('dialog').getByRole('button', { name: genre }).click()
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${nom}`) }).click()
  }
  await expect(page.getByText('durée totale', { exact: false })).toContainText('32 min')
  await page.getByRole('group', { name: 'Durée du bloc 2' }).getByRole('button', { name: '5 minutes de plus' }).click()
  await page.getByRole('button', { name: 'Monter le bloc 2' }).click()
  await expect(page.locator('.bloc .infos strong')).toHaveText(['Corne', 'Échauffement 3 lignes', 'À supprimer'])

  // Un système supprimé de la bibliothèque est ignoré en présentation.
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('tab', { name: 'Systèmes' }).click()
  await page.getByRole('button', { name: 'Options de À supprimer' }).click()
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await page.getByRole('tab', { name: 'Séances' }).click()
  await expect(page.getByText('3 blocs, 27 min', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Présenter' }).click()

  await expect(page.locator('.titre-presentation')).toContainText('1 / 2Corne')
  await expect(page.getByRole('timer')).toHaveText('15:00')
  await page.getByRole('button', { name: 'Démarrer' }).click()
  await expect(page.getByRole('timer')).toHaveText('14:59', { timeout: 3000 })
  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(page.locator('.titre-presentation')).toContainText('2 / 2Échauffement 3 lignes')
  await expect(page.getByRole('timer')).toHaveText('12:00')
  await expect(page.getByText('Passes à deux mains, appels.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suivant' })).toBeDisabled()
  await page.getByRole('button', { name: 'Quitter' }).click()
  await expect(page.getByLabel('Nom de la séance')).toHaveValue('Mardi U15')
})

test('tableau blanc : annoter par-dessus un système sans le modifier', async ({ page }) => {
  await passerEnModeAvion(page)
  await page.getByRole('button', { name: 'Nouveau système' }).click()
  await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill('Temps mort')
  await page.getByRole('button', { name: 'Créer' }).click()
  for (const [x, y] of [[9, 7.5], [5.5, 1.8]] as const) await toucher(page, x, y)
  await page.getByRole('button', { name: 'Dessiner' }).click()
  await tracer(page, [[5.5, 1.8], [4, 2.5], [2.5, 3.5]])
  await page.getByRole('button', { name: 'Coupe' }).click()

  await page.getByRole('button', { name: 'Tableau blanc' }).click()
  const calque = page.getByLabel('Tableau blanc', { exact: true })
  const boite = (await calque.boundingBox())!
  const griffonner = async (dx: number) => {
    await page.mouse.move(boite.x + boite.width * 0.3 + dx, boite.y + boite.height * 0.4)
    await page.mouse.down()
    await page.mouse.move(boite.x + boite.width * 0.6 + dx, boite.y + boite.height * 0.6, { steps: 10 })
    await page.mouse.up()
  }
  await griffonner(0)
  await page.getByRole('button', { name: 'Bleu' }).click()
  await page.getByRole('button', { name: 'Épais' }).click()
  await griffonner(40)
  await expect(calque.locator('path')).toHaveCount(2)
  await expect(calque.locator('path').last()).toHaveAttribute('stroke', '#1f5fa8')
  await page.getByRole('button', { name: 'Effacer tout' }).click()
  await expect(calque.locator('path')).toHaveCount(0)
  await griffonner(0)
  await page.getByRole('button', { name: 'Fermer' }).click()
  await expect(calque).toHaveCount(0)

  // Le système n'a pas changé : toujours 2 joueurs et 1 action, et le tableau rouvert est vide.
  await expect(page.locator('.joueur')).toHaveCount(2)
  await expect(page.locator('.zone-terrain .action')).toHaveCount(1)
  await page.getByRole('button', { name: 'Tableau blanc' }).click()
  await expect(calque.locator('path')).toHaveCount(0)
})

test('export en image et en PDF (système seul et playbook), hors ligne', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'canShare', { value: undefined }) })
  await passerEnModeAvion(page)
  const telecharger = async (declencher: () => Promise<void>) => {
    const t = page.waitForEvent('download')
    await declencher()
    await page.getByRole('button', { name: 'Partager ou enregistrer' }).click()
    const d = await t
    return { nom: d.suggestedFilename(), contenu: await readFile((await d.path())!) }
  }
  const pages = (pdf: Buffer) => (pdf.toString('latin1').match(/\/Type \/Page[^s]/g) ?? []).length

  for (const nom of ['Sortie de zone', 'Écran étagé']) {
    await page.getByRole('button', { name: 'Nouveau système' }).click()
    await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill(nom)
    await page.getByRole('button', { name: 'Créer' }).click()
    if (nom === 'Écran étagé') break
    await page.getByRole('button', { name: 'Bibliothèque' }).click()
  }
  for (const [x, y] of [[9, 7.5], [5.5, 1.8]] as const) await toucher(page, x, y)
  await page.getByPlaceholder('Ce qui se passe à cette étape…').fill('Le 2 sort de l’écran étagé, passe à l’aile.')
  await page.getByRole('button', { name: 'Ajouter l’étape suivante' }).click()

  const etape = await telecharger(async () => {
    await page.getByRole('button', { name: 'Plus' }).click()
    await page.getByRole('button', { name: 'Image de cette étape' }).click()
  })
  expect(etape.nom).toBe('ecran-etage-etape-2.png')
  expect(etape.contenu.subarray(1, 4).toString()).toBe('PNG')

  const image = await telecharger(async () => {
    await page.getByRole('button', { name: 'Plus' }).click()
    await page.getByRole('button', { name: 'Image avec toutes les étapes' }).click()
  })
  expect(image.contenu.subarray(1, 4).toString()).toBe('PNG')
  expect(image.contenu.readUInt32BE(16)).toBeGreaterThan(1800) // largeur : deux colonnes d'étapes

  const pdf = await telecharger(async () => {
    await page.getByRole('button', { name: 'Plus' }).click()
    await page.getByRole('button', { name: 'PDF à imprimer' }).click()
  })
  expect(pdf.nom).toBe('ecran-etage.pdf')
  expect(pdf.contenu.subarray(0, 5).toString()).toBe('%PDF-')
  expect(pages(pdf.contenu)).toBe(1)

  // Playbook : couverture + une page par système.
  await page.getByRole('button', { name: 'Bibliothèque' }).click()
  const playbook = await telecharger(() => page.getByRole('button', { name: 'Playbook PDF' }).click())
  expect(playbook.nom).toBe('playbook-tous-les-systemes.pdf')
  expect(pages(playbook.contenu)).toBe(3)
})

test('révision : choisir son poste, répondre, voir la correction et le score', async ({ page }) => {
  await passerEnModeAvion(page)
  await page.getByRole('button', { name: 'Nouveau système' }).click()
  await page.getByPlaceholder('Ex. : Corne, sortie de 1').fill('Sortie du 2')
  await page.getByRole('button', { name: 'Créer' }).click()
  for (const [x, y] of [[9, 7.5], [5.5, 1.8], [5.5, 13.2]] as const) await toucher(page, x, y)
  await page.getByRole('button', { name: 'Dessiner' }).click()
  await tracer(page, [[5.5, 1.8], [4, 2.5], [2.5, 3.5]])
  await page.getByRole('button', { name: 'Coupe' }).click()
  await page.getByRole('button', { name: 'Ajouter l’étape suivante' }).click()
  await page.getByRole('button', { name: 'Bibliothèque' }).click()

  await page.getByRole('tab', { name: 'Révision' }).click()
  await expect(page.getByRole('heading', { name: 'À retravailler' })).toBeVisible()
  await page.getByRole('button', { name: 'Réviser' }).click()
  await page.getByRole('button', { name: '2', exact: true }).click()

  // Étape 1 : il coupe (juste), il arrive au poste bas (juste).
  await expect(page.getByRole('heading', { name: 'Que fait le 2 ?' })).toBeVisible()
  await expect(page.locator('.zone-terrain .action')).toHaveCount(0) // flèches cachées pendant la question
  await page.getByRole('button', { name: 'Coupe' }).click()
  await expect(page.getByText('Juste !')).toBeVisible()
  await expect(page.locator('.zone-terrain .action')).toHaveCount(1) // correction : l'étape se montre
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await expect(page.getByRole('button', { name: 'Valider' })).toBeDisabled()
  await toucher(page, 2.8, 3.2)
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByText('Juste !')).toBeVisible()
  await page.getByRole('button', { name: 'Question suivante' }).click()

  // Étape 2 : il ne bouge pas, on répond faux.
  await page.getByRole('button', { name: 'Dribble' }).click()
  await expect(page.getByText('Non : il ne bouge pas.')).toBeVisible()
  await page.getByRole('button', { name: 'Voir le score' }).click()
  await expect(page.locator('.score')).toHaveText('2 / 3')
  await expect(page.getByText('Étape 2 : le 2 : il ne bouge pas')).toBeVisible()

  // Recommencer en répondant tout juste → « Bien su ».
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await page.getByRole('button', { name: 'Coupe' }).click()
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await toucher(page, 2.5, 3.5)
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await page.getByRole('button', { name: 'Ne bouge pas' }).click()
  await page.getByRole('button', { name: 'Voir le score' }).click()
  await expect(page.locator('.score')).toHaveText('3 / 3')
  await page.getByRole('button', { name: 'Terminer' }).click()
  await page.getByRole('tab', { name: 'Révision' }).click()
  await expect(page.getByRole('heading', { name: 'Bien su' })).toBeVisible()
  await expect(page.getByText('dernier score 3 / 3')).toBeVisible()
})
