// Coordonnées en mètres : x = distance à la ligne de fond (panier attaqué en x = 1,575), y = distance à la ligne de touche.
export type Point = [number, number]
export type Camp = 'attaque' | 'defense'
export type TypeAction = 'coupe' | 'passe' | 'dribble' | 'ecran'

export interface Joueur { id: string; camp: Camp; numero: number; x: number; y: number }

// chemin = départ, courbure, arrivée (+ courbure, arrivée pour chaque coin) : Bézier quadratiques enchaînées.
export interface Action { id: string; type: TypeAction; joueur: string; vers?: string; chemin: Point[]; couleur: string }

export interface Texte { id: string; x: number; y: number; texte: string }

export interface Etape {
  id: string
  description: string
  joueurs: Joueur[]
  ballon: string | null
  actions: Action[]
  textes: Texte[]
}

export interface Terrain { vue: 'demi' | 'entier'; longueur: number; largeur: number; ligne3pts: number | null }

export interface Systeme { id: string; nom: string; terrain: Terrain; creeLe: string; modifieLe: string; etapes: Etape[] }

export const nouvelId = (prefixe: string) => `${prefixe}-${Math.random().toString(36).slice(2, 10)}`
