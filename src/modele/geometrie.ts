import type { Point } from './types.ts'

export const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])
export const proche = (a: Point, b: Point, tolerance = 0.05) => distance(a, b) < tolerance
export const fin = (chemin: Point[]) => chemin[chemin.length - 1]

// Déplace le départ (ou l'arrivée) d'un chemin ; la courbure voisine suit à moitié pour garder la forme.
export function deplacerDebut(chemin: Point[], p: Point): Point[] {
  const [dx, dy] = [p[0] - chemin[0][0], p[1] - chemin[0][1]]
  return [p, [chemin[1][0] + dx / 2, chemin[1][1] + dy / 2], ...chemin.slice(2)]
}
export function deplacerFin(chemin: Point[], p: Point): Point[] {
  return deplacerDebut([...chemin].reverse(), p).reverse()
}

const quad = (a: Point, c: Point, b: Point, t: number): Point => {
  const u = 1 - t
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]
}

// Ligne brisée fine qui suit le chemin (20 points par morceau de courbe).
export function polyligne(chemin: Point[]): Point[] {
  const pts: Point[] = [chemin[0]]
  for (let i = 0; i + 2 < chemin.length; i += 2)
    for (let k = 1; k <= 20; k++) pts.push(quad(chemin[i], chemin[i + 1], chemin[i + 2], k / 20))
  return pts
}

export function longueur(pts: Point[]) {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += distance(pts[i - 1], pts[i])
  return l
}

// Point situé à la fraction f (0 → 1) de la longueur d'une ligne brisée.
export function pointA(pts: Point[], f: number): Point {
  let reste = Math.min(1, Math.max(0, f)) * longueur(pts)
  for (let i = 1; i < pts.length; i++) {
    const d = distance(pts[i - 1], pts[i])
    if (reste <= d && d > 0) {
      const t = reste / d
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
    }
    reste -= d
  }
  return pts[pts.length - 1]
}
