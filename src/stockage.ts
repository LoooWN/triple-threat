import { createStore, del, set, values } from 'idb-keyval'
import type { Systeme, Terrain } from './modele/types.ts'

const base = createStore('triple-threat', 'systemes')

export const listerSystemes = () => values<Systeme>(base)
export const enregistrerSysteme = (s: Systeme) => set(s.id, s, base)
export const supprimerSysteme = (id: string) => del(id, base)

// Évite que Safari efface les données (surtout utile une fois l'appli sur l'écran d'accueil).
export const demanderPersistance = () => navigator.storage?.persist?.().catch(() => false)

// Sur iPad, la feuille de partage permet « Enregistrer dans Fichiers », AirDrop, Messages…
export async function partagerFichier(nom: string, contenu: string) {
  const fichier = new File([contenu], nom, { type: 'application/json' })
  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(fichier)
  const lien = Object.assign(document.createElement('a'), { href: url, download: nom })
  lien.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const CLE_TERRAIN = 'triple-threat:dernier-terrain'
export const TERRAIN_STANDARD: Terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 }

export function dernierTerrain(): Terrain {
  try {
    const t = JSON.parse(localStorage.getItem(CLE_TERRAIN) ?? 'null')
    if (t && typeof t.longueur === 'number') return t
  } catch { /* stockage indisponible : on garde le terrain standard */ }
  return TERRAIN_STANDARD
}

export function retenirTerrain(t: Terrain) {
  try {
    localStorage.setItem(CLE_TERRAIN, JSON.stringify(t))
  } catch { /* simple confort, sans conséquence */ }
}
