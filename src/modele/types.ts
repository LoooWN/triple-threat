// Coordonnées en mètres : x = distance à la ligne de fond (panier attaqué en x = 1,575), y = distance à la ligne de touche.
export type Point = [number, number]
export type Camp = 'attaque' | 'defense' | 'coach'
export type TypeAction = 'coupe' | 'passe' | 'dribble' | 'ecran'
export type Genre = 'systeme' | 'exercice'
export type TypeMateriel = 'plot' | 'echelle' | 'ballon'

export interface Joueur { id: string; camp: Camp; numero: number; x: number; y: number }

// chemin = départ, courbure, arrivée (+ courbure, arrivée pour chaque coin) : Bézier quadratiques enchaînées.
export interface Action { id: string; type: TypeAction; joueur: string; vers?: string; chemin: Point[]; couleur: string }

export interface Texte { id: string; x: number; y: number; texte: string }

export interface Etape {
  id: string
  description: string
  joueurs: Joueur[]
  ballons: string[] // ids des porteurs (un seul dans un système)
  actions: Action[]
  textes: Texte[]
}

export interface Terrain { vue: 'demi' | 'entier'; longueur: number; largeur: number; ligne3pts: number | null }

// Fixe pour tout le document ; angle en degrés (échelle).
export interface Materiel { id: string; type: TypeMateriel; x: number; y: number; angle: number }

// Un document de la bibliothèque : système ou exercice.
export interface Systeme {
  id: string
  genre: Genre
  nom: string
  categorie: string
  terrain: Terrain
  creeLe: string
  modifieLe: string
  etapes: Etape[]
  equipe: string | null // équipe dont on affiche les maillots
  maillots: Record<string, string> // id du pion → id du joueur de l'équipe
  materiel: Materiel[]
  miseEnPlace: string
  pointsCles: string
  variantes: string
  dureeConseillee: number // minutes
}

export interface JoueurEffectif { id: string; nom: string; maillot: string }
export interface Equipe { id: string; nom: string; joueurs: JoueurEffectif[]; modifieLe: string }

export interface Bloc { id: string; document: string; duree: number; note: string }
export interface Seance { id: string; nom: string; date: string; blocs: Bloc[]; creeLe: string; modifieLe: string }

export const nouvelId = (prefixe: string) => `${prefixe}-${Math.random().toString(36).slice(2, 10)}`

// Révision (sur l'appareil qui révise) : un score par passage, et les paquets reçus par lien.
export interface Resultat { id: string; document: string; date: string; poste: number | null; bonnes: number; total: number }
export interface Paquet { id: string; titre: string; creeLe: string; systemes: Systeme[] }

// Statistiques de match, notées en direct par le coach.
export type Stat = 'tir2' | 'tir2rate' | 'tir3' | 'tir3rate' | 'lf' | 'lfrate' | 'rebOff' | 'rebDef' | 'passe' | 'interception' | 'contre' | 'perte' | 'faute'
export interface Evenement { id: string; joueur: string; stat: Stat; quart: number }
export interface Match {
  id: string
  equipe: string | null
  adversaire: string
  date: string
  presents: string[] // ids des joueurs de l'équipe
  evenements: Evenement[]
  adverses: { id: string; quart: number; points: number }[]
  quart: number // 1 à 4, puis 5, 6… pour les prolongations
  creeLe: string
  modifieLe: string
}
