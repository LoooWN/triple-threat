import { createStore, del, set, values } from 'idb-keyval'
import { normaliser } from './modele/documents.ts'
import type { Equipe, Match, Paquet, Resultat, Seance, Systeme, Terrain } from './modele/types.ts'

// Une base par collection (idb-keyval ne gère qu'un magasin par base).
const bases = {
  systemes: createStore('triple-threat', 'systemes'),
  seances: createStore('triple-threat-seances', 'seances'),
  equipes: createStore('triple-threat-equipes', 'equipes'),
  resultats: createStore('triple-threat-resultats', 'resultats'),
  paquets: createStore('triple-threat-paquets', 'paquets'),
  matchs: createStore('triple-threat-matchs', 'matchs'),
}
export type Collection = keyof typeof bases
export interface Elements { systemes: Systeme; seances: Seance; equipes: Equipe; resultats: Resultat; paquets: Paquet; matchs: Match }

export async function lister<C extends Collection>(c: C): Promise<Elements[C][]> {
  const tout = await values<Elements[C]>(bases[c])
  // Les systèmes enregistrés par la phase 1 sont convertis à la lecture.
  return c === 'systemes' ? (tout as object[]).map(normaliser) as Elements[C][] : tout
}
export const enregistrer = <C extends Collection>(c: C, x: Elements[C]) => set(x.id, x, bases[c])
export const supprimer = (c: Collection, id: string) => del(id, bases[c])

// Évite que Safari efface les données (surtout utile une fois l'appli sur l'écran d'accueil).
export const demanderPersistance = () => navigator.storage?.persist?.().catch(() => false)

// Sur iPad, la feuille de partage permet « Enregistrer dans Fichiers », AirDrop, Messages…
export async function partagerFichier(nom: string, contenu: string | Blob, type = 'application/json') {
  const fichier = new File([contenu], nom, { type })
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
