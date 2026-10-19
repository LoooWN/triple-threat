// Génère les icônes PNG à partir de public/icone.svg (à relancer si l'icône change).
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/icone.svg', import.meta.url), 'utf8')
const navigateur = await chromium.launch()
const page = await navigateur.newPage()
for (const [fichier, taille] of [['icone-192.png', 192], ['icone-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: taille, height: taille })
  await page.setContent(`<style>body{margin:0}svg{display:block;width:${taille}px;height:${taille}px}</style>${svg}`)
  await page.screenshot({ path: new URL(`../public/${fichier}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1') })
}
await navigateur.close()
