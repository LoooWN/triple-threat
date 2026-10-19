import { distance, longueur, pointA } from './geometrie.ts'
import type { Point } from './types.ts'

const PAS = 0.1 // m entre deux points rééchantillonnés
const FENETRE = 6 // 0,6 m de part et d'autre pour mesurer un virage
const ANGLE_COIN = (75 * Math.PI) / 180
const LONGUEUR_MIN = 0.5

const arrondi = (p: Point): Point => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]

function angle(a: Point, b: Point) {
  const c = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b) || 1)
  return Math.acos(Math.max(-1, Math.min(1, c)))
}

// Point de courbure d'une Bézier quadratique (extrémités fixées) au plus près des points, par moindres carrés.
function courbure(pts: Point[]): Point {
  const [p0, p2] = [pts[0], pts[pts.length - 1]]
  const total = longueur(pts)
  let [nx, ny, den, cumul] = [0, 0, 0, 0]
  for (let i = 1; i < pts.length - 1; i++) {
    cumul += distance(pts[i - 1], pts[i])
    const t = cumul / total
    const [u, b] = [1 - t, 2 * t * (1 - t)]
    nx += b * (pts[i][0] - u * u * p0[0] - t * t * p2[0])
    ny += b * (pts[i][1] - u * u * p0[1] - t * t * p2[1])
    den += b * b
  }
  return den ? [nx / den, ny / den] : [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2]
}

// Trait à main levée → chemin propre : départ, courbure, arrivée, avec un morceau de plus par coin net.
export function lisserTrace(brut: Point[]): Point[] | null {
  const total = longueur(brut)
  if (total < LONGUEUR_MIN) return null
  const n = Math.max(2, Math.round(total / PAS))
  const r = Array.from({ length: n + 1 }, (_, i) => pointA(brut, i / n))

  const coins: number[] = []
  let [meilleur, angleMeilleur] = [-1, 0]
  for (let i = FENETRE; i < r.length - FENETRE; i++) {
    const a = angle([r[i][0] - r[i - FENETRE][0], r[i][1] - r[i - FENETRE][1]], [r[i + FENETRE][0] - r[i][0], r[i + FENETRE][1] - r[i][1]])
    if (a > ANGLE_COIN) {
      if (meilleur < 0 || a > angleMeilleur) [meilleur, angleMeilleur] = [i, a]
    } else if (meilleur >= 0) {
      coins.push(meilleur)
      meilleur = -1
    }
  }
  if (meilleur >= 0) coins.push(meilleur)

  const bornes = [0, ...coins, r.length - 1]
  const chemin: Point[] = [r[0]]
  for (let k = 1; k < bornes.length; k++) {
    const morceau = r.slice(bornes[k - 1], bornes[k] + 1)
    chemin.push(courbure(morceau), morceau[morceau.length - 1])
  }
  return chemin.map(arrondi)
}
