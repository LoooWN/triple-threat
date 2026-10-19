import type { Point, Terrain } from '../modele/types.ts'

// Passage mètres du terrain ↔ dessin à l'écran. Demi-terrain : panier en haut. Terrain entier : panier attaqué à droite.
export const MARGE = 1.2

export const cadre = (t: Terrain) =>
  t.vue === 'demi'
    ? { largeur: t.largeur + 2 * MARGE, hauteur: t.longueur / 2 + 2 * MARGE }
    : { largeur: t.longueur + 2 * MARGE, hauteur: t.largeur + 2 * MARGE }

export const versEcran = (t: Terrain, [x, y]: Point): Point =>
  t.vue === 'demi' ? [y + MARGE, x + MARGE] : [t.longueur - x + MARGE, y + MARGE]

export const depuisEcran = (t: Terrain, [sx, sy]: Point): Point =>
  t.vue === 'demi' ? [sy - MARGE, sx - MARGE] : [t.longueur - (sx - MARGE), sy - MARGE]

// Les lignes du terrain sont dessinées en mètres puis tournées d'un bloc.
export const matrice = (t: Terrain) =>
  t.vue === 'demi' ? `matrix(0 1 1 0 ${MARGE} ${MARGE})` : `matrix(-1 0 0 1 ${t.longueur + MARGE} ${MARGE})`

// Garde un point dans la zone visible (terrain + abords), arrondi au centimètre.
export function borner(t: Terrain, [x, y]: Point): Point {
  const xMax = (t.vue === 'demi' ? t.longueur / 2 : t.longueur) + MARGE - 0.3
  const b = (v: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, v)) * 100) / 100
  return [b(x, -MARGE + 0.3, xMax), b(y, -MARGE + 0.3, t.largeur + MARGE - 0.3)]
}
