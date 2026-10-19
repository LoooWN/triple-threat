import { nouvelId, type Equipe, type Etape, type Genre, type Systeme, type Terrain } from './types.ts'

export const CATEGORIES: Record<Genre, string[]> = {
  systeme: ['Attaque', 'Défense', 'Remise en jeu', 'Contre-attaque', 'Fin de match'],
  exercice: ['Échauffement', 'Tir', 'Passe', 'Dribble', 'Défense', 'Jeu réduit'],
}

const DEFAUTS = {
  genre: 'systeme', categorie: 'Attaque', equipe: null, maillots: {}, materiel: [],
  miseEnPlace: '', pointsCles: '', variantes: '', dureeConseillee: 10,
} as const

export function nouveauDocument(genre: Genre, nom: string, terrain: Terrain, categorie: string): Systeme {
  const maintenant = new Date().toISOString()
  const etape: Etape = { id: nouvelId('e'), description: '', joueurs: [], ballons: [], actions: [], textes: [] }
  return { ...DEFAUTS, maillots: {}, materiel: [], id: nouvelId('s'), genre, nom, categorie, terrain, creeLe: maintenant, modifieLe: maintenant, etapes: [etape] }
}

// Les documents de la phase 1 (version 1) n'ont ni genre ni catégorie, et un seul `ballon` par étape.
export function normaliser(doc: object): Systeme {
  const d = doc as Omit<Systeme, 'etapes'> & { etapes: (Omit<Etape, 'ballons'> & { ballons?: string[]; ballon?: string | null })[] }
  return {
    ...DEFAUTS,
    ...d,
    etapes: d.etapes.map(({ ballon, ballons, ...e }) => ({ ...e, ballons: ballons ?? (ballon ? [ballon] : []) })),
  }
}

export function variante(s: Systeme): Systeme {
  const maintenant = new Date().toISOString()
  return { ...structuredClone(s), id: nouvelId('s'), nom: `${s.nom} – variante`, creeLe: maintenant, modifieLe: maintenant }
}

export const simplifier = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Tous les mots doivent apparaître quelque part : nom, catégorie, descriptions d'étapes, fiche.
export function rechercher(docs: Systeme[], texte: string): Systeme[] {
  const mots = simplifier(texte).split(/\s+/).filter(Boolean)
  if (!mots.length) return docs
  return docs.filter((d) => {
    const tout = simplifier([d.nom, d.categorie, d.miseEnPlace, d.pointsCles, d.variantes, ...d.etapes.map((e) => e.description)].join(' '))
    return mots.every((m) => tout.includes(m))
  })
}

export const categoriesDe = (genre: Genre, docs: Systeme[]) =>
  [...new Set([...CATEGORIES[genre], ...docs.filter((d) => d.genre === genre).map((d) => d.categorie)])]

// Relie un pion à un joueur de l'équipe (null : le délie). Un joueur n'est relié qu'à un seul pion.
export function assignerMaillot(s: Systeme, pion: string, joueur: string | null): Systeme {
  const reste = Object.fromEntries(Object.entries(s.maillots).filter(([p, j]) => p !== pion && j !== joueur))
  return { ...s, maillots: joueur ? { ...reste, [pion]: joueur } : reste }
}

// Maillots à afficher : seulement si l'équipe et le joueur existent encore.
export function maillotsAffiches(s: Systeme, equipes: Equipe[]): Record<string, { maillot: string; nom: string }> {
  const equipe = equipes.find((e) => e.id === s.equipe)
  if (!equipe) return {}
  return Object.fromEntries(Object.entries(s.maillots).flatMap(([pion, id]) => {
    const j = equipe.joueurs.find((x) => x.id === id)
    return j ? [[pion, { maillot: j.maillot, nom: j.nom }]] : []
  }))
}
