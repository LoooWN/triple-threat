// Petit langage pour décrire les contenus tout faits (exercices, systèmes, séances) en quelques lignes.
import { etapeSuivante, positionsFinales } from '../../src/modele/etapes.ts'
import type { Action, Bloc, Camp, Etape, Genre, Joueur, Materiel, Point, Seance, Systeme, Terrain, TypeMateriel } from '../../src/modele/types.ts'

export const DEMI: Terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 }
export const ENTIER: Terrain = { vue: 'entier', longueur: 28, largeur: 15, ligne3pts: 6.75 }
const DATE = '2026-10-20T08:00:00.000Z'
const ENCRE = '#1b2430'
const ROUGE = '#b8322a'

// Repères du demi-terrain : x = distance à la ligne de fond du panier attaqué, y = distance à la touche gauche.
export const R = {
  panier: [1.575, 7.5], haut: [8.8, 7.5], aileG: [6, 1.9], aileD: [6, 13.1], coinG: [0.9, 1], coinD: [0.9, 14],
  coudeG: [5.8, 5.05], coudeD: [5.8, 9.95], lf: [5.8, 7.5], posteBasG: [2.3, 5.2], posteBasD: [2.3, 9.8],
  postHautG: [5.2, 5.6], postHautD: [5.2, 9.4], ailetteG: [8, 3.5], ailetteD: [8, 11.5], centre: [14, 7.5],
} satisfies Record<string, Point>

export const PANIER_LOIN: Point = [26.425, 7.5]

const arrondi = (p: Point): Point => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]
const milieu = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

// Un segment : point de passage, ou { c } pour le point de courbure du morceau qui suit.
export type Seg = Point | { c: Point }

function chemin(depart: Point, segs: Seg[]): Point[] {
  const res: Point[] = [depart]
  let courbure: Point | null = null
  for (const s of segs) {
    if ('c' in s) courbure = s.c
    else {
      res.push(courbure ?? milieu(res[res.length - 1], s), s)
      courbure = null
    }
  }
  return res.map(arrondi)
}

// Identifiant d'un joueur à partir de sa clé : '1' → attaquant, 'X1' → défenseur, 'C' → coach.
const camp = (cle: string): Camp => (cle.startsWith('X') ? 'defense' : cle.startsWith('C') ? 'coach' : 'attaque')
const idDe = (cle: string) => (cle.startsWith('X') ? `D${cle.slice(1)}` : cle.startsWith('C') ? cle : `A${cle}`)

export class Actions {
  actions: Action[] = []
  textes: Etape['textes'] = []
  private passes: { k: number; depart: Point; via?: Point }[] = []
  private n = 0
  private e: Etape
  private prefixe: string
  constructor(e: Etape, prefixe: string) {
    this.e = e
    this.prefixe = prefixe
  }

  private pos(cle: string): Point {
    const id = idDe(cle)
    const fin = [...this.actions].reverse().find((a) => a.joueur === id && a.type !== 'passe')
    if (fin) return fin.chemin[fin.chemin.length - 1]
    const j = this.e.joueurs.find((x) => x.id === id)
    if (!j) throw new Error(`${this.prefixe} : joueur ${cle} absent`)
    return [j.x, j.y]
  }
  private ajouter(type: Action['type'], cle: string, segs: Seg[]) {
    const id = idDe(cle)
    const couleur = camp(cle) === 'defense' ? ROUGE : ENCRE
    this.actions.push({ id: `${this.prefixe}-a${this.n++}`, type, joueur: id, chemin: chemin(this.pos(cle), segs), couleur })
    return this
  }
  coupe(cle: string, ...segs: Seg[]) { return this.ajouter('coupe', cle, segs) }
  dribble(cle: string, ...segs: Seg[]) { return this.ajouter('dribble', cle, segs) }
  ecran(cle: string, ...segs: Seg[]) { return this.ajouter('ecran', cle, segs) }
  // L'ordre compte : le joueur enchaîne ses actions (passer puis couper ≠ couper puis passer).
  // La passe part d'où est le passeur maintenant ; son arrivée se résout à la fin (le receveur peut encore bouger).
  passe(de: string, vers: string, via?: Point) {
    this.passes.push({ k: this.actions.length, depart: this.pos(de), via })
    this.actions.push({ id: `${this.prefixe}-a${this.n++}`, type: 'passe', joueur: idDe(de), vers: idDe(vers), couleur: ENCRE, chemin: [] })
    return this
  }
  // Tir : une flèche en pointillés vers le panier attaqué (ou `PANIER_LOIN` sur tout le terrain).
  tir(de: string, via?: Point, cible: Point = R.panier as Point) {
    const c = chemin(this.pos(de), via ? [{ c: via }, cible] : [cible])
    this.actions.push({ id: `${this.prefixe}-a${this.n++}`, type: 'passe', joueur: idDe(de), couleur: ENCRE, chemin: c })
    return this
  }
  texte(p: Point, t: string) { this.textes.push({ id: `${this.prefixe}-t${this.textes.length}`, x: p[0], y: p[1], texte: t }); return this }

  resoudre(): Action[] {
    const finales = positionsFinales({ ...this.e, actions: this.actions })
    for (const p of this.passes) {
      const a = this.actions[p.k]
      const arrivee = finales.get(a.vers!)
      if (!arrivee) throw new Error(`${this.prefixe} : receveur ${a.vers} absent`)
      a.chemin = chemin(p.depart, p.via ? [{ c: p.via }, arrivee] : [arrivee])
    }
    return this.actions
  }
}

interface Options {
  id: string
  genre: Genre
  nom: string
  categorie: string
  terrain?: Terrain
  source: string
  miseEnPlace?: string
  pointsCles?: string
  variantes?: string
  duree?: number
}

export class Doc {
  private etapes: Etape[] = []
  private materielListe: Materiel[] = []
  private premiere = true
  private o: Options
  constructor(o: Options, joueurs: Record<string, Point>, ballons: string[] = []) {
    this.o = o
    const liste: Joueur[] = Object.entries(joueurs).map(([cle, p]) => ({
      id: idDe(cle), camp: camp(cle), numero: camp(cle) === 'coach' ? 0 : Number(cle.replace(/^X/, '')) || 0, x: p[0], y: p[1],
    }))
    this.etapes.push({ id: `${o.id}-e0`, description: '', joueurs: liste.map((j) => ({ ...j, x: arrondi([j.x, j.y])[0], y: arrondi([j.x, j.y])[1] })), ballons: ballons.map(idDe), actions: [], textes: [] })
  }

  materiel(type: TypeMateriel, ...points: Point[]) {
    for (const p of points) this.materielListe.push({ id: `${this.o.id}-m${this.materielListe.length}`, type, x: p[0], y: p[1], angle: 0 })
    return this
  }

  // Une étape : description + actions. `placer` repositionne des joueurs au début de l'étape (hors étape 1).
  etape(description: string, f: (a: Actions) => void = () => {}, opts: { placer?: Record<string, Point>; ballons?: string[] } = {}) {
    let e = this.premiere ? this.etapes[0] : etapeSuivante(this.etapes[this.etapes.length - 1])
    if (!this.premiere) e = { ...e, id: `${this.o.id}-e${this.etapes.length}` }
    if (opts.placer) e = { ...e, joueurs: e.joueurs.map((j) => {
      const cle = Object.keys(opts.placer!).find((k) => idDe(k) === j.id)
      return cle ? { ...j, x: opts.placer![cle][0], y: opts.placer![cle][1] } : j
    }) }
    if (opts.ballons) e = { ...e, ballons: opts.ballons.map(idDe) }
    const a = new Actions(e, e.id)
    f(a)
    e = { ...e, description, actions: a.resoudre(), textes: a.textes }
    if (this.premiere) this.etapes[0] = e
    else this.etapes.push(e)
    this.premiere = false
    return this
  }

  fin(): Systeme {
    const o = this.o
    return {
      id: o.id, genre: o.genre, nom: o.nom, categorie: o.categorie, terrain: o.terrain ?? DEMI,
      creeLe: DATE, modifieLe: DATE, etapes: this.etapes, equipe: null, maillots: {}, materiel: this.materielListe,
      miseEnPlace: o.miseEnPlace ?? '', pointsCles: o.pointsCles ?? '',
      variantes: [o.variantes, `Source : ${o.source}`].filter(Boolean).join('\n\n'),
      dureeConseillee: o.duree ?? 10,
    }
  }
}

export const exercice = (o: Omit<Options, 'genre'>, joueurs: Record<string, Point>, ballons?: string[]) =>
  new Doc({ ...o, genre: 'exercice' }, joueurs, ballons)
export const systeme = (o: Omit<Options, 'genre'>, joueurs: Record<string, Point>, ballons?: string[]) =>
  new Doc({ ...o, genre: 'systeme' }, joueurs, ballons)

export function seance(id: string, nom: string, blocs: [string, number, string?][]): Seance {
  return {
    id, nom, date: '', creeLe: DATE, modifieLe: DATE,
    blocs: blocs.map(([document, duree, note], k): Bloc => ({ id: `${id}-b${k}`, document, duree, note: note ?? '' })),
  }
}

export interface Paquet { id: string; titre: string; description: string; credits: string; licence?: string; systemes: Systeme[]; seances: Seance[] }
