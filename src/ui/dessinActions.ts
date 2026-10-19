import { distance, longueur, pointA, polyligne } from '../modele/geometrie.ts'
import type { Action, Point, Terrain } from '../modele/types.ts'
import { versEcran } from './vue.ts'

const RETRAIT_PASSE = 0.55 // la flèche s'arrête devant le receveur
const FLECHE = 0.5
const LARGEUR_FLECHE = 0.44
const BARRE = 0.9
const ONDE = 0.6 // longueur d'une ondulation de dribble
const AMPLITUDE = 0.16

export const chemin2d = (pts: Point[]) => 'M' + pts.map((p) => `${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(' L')

function couper(pts: Point[], l: number): Point[] {
  const res: Point[] = [pts[0]]
  let reste = l
  for (let i = 1; i < pts.length; i++) {
    const d = distance(pts[i - 1], pts[i])
    if (reste <= d) {
      const t = d ? reste / d : 0
      res.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t])
      return res
    }
    res.push(pts[i])
    reste -= d
  }
  return res
}

function onduler(pts: Point[]): Point[] {
  const total = longueur(pts)
  const res: Point[] = []
  for (let s = 0; s < total; s += 0.05) {
    const p = pointA(pts, s / total)
    const q = pointA(pts, Math.min(1, (s + 0.05) / total))
    const n = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
    const a = s < total - 0.3 ? AMPLITUDE * Math.sin((2 * Math.PI * s) / ONDE) : 0
    res.push([p[0] - ((q[1] - p[1]) / n) * a, p[1] + ((q[0] - p[0]) / n) * a])
  }
  res.push(pts[pts.length - 1])
  return res
}

// Tracé à l'écran : coupe = plein + flèche, passe = pointillés + flèche, dribble = ondulé + flèche, écran = plein + barre.
export function traceAction(a: Action, t: Terrain): { ligne: string; tete?: string; barre?: string; zone: string } {
  let pts = polyligne(a.chemin).map((p) => versEcran(t, p))
  const zone = chemin2d(pts)
  if (a.type === 'passe') pts = couper(pts, Math.max(longueur(pts) * 0.4, longueur(pts) - RETRAIT_PASSE))
  const total = longueur(pts)
  const bout = pts[pts.length - 1]
  const avant = pointA(pts, total > 0.3 ? (total - 0.3) / total : 0)
  const l = distance(bout, avant) || 1
  const [dx, dy] = [(bout[0] - avant[0]) / l, (bout[1] - avant[1]) / l]
  const p2 = (p: Point) => `${p[0].toFixed(3)} ${p[1].toFixed(3)}`

  if (a.type === 'ecran') {
    const [nx, ny] = [-dy * (BARRE / 2), dx * (BARRE / 2)]
    return { ligne: chemin2d(pts), barre: `M${p2([bout[0] + nx, bout[1] + ny])} L${p2([bout[0] - nx, bout[1] - ny])}`, zone }
  }
  const base: Point = [bout[0] - dx * FLECHE, bout[1] - dy * FLECHE]
  const [nx, ny] = [-dy * (LARGEUR_FLECHE / 2), dx * (LARGEUR_FLECHE / 2)]
  const tete = `M${p2(bout)} L${p2([base[0] + nx, base[1] + ny])} L${p2([base[0] - nx, base[1] - ny])} Z`
  const corps = couper(pts, Math.max(0, total - FLECHE * 0.8))
  return { ligne: chemin2d(a.type === 'dribble' ? onduler(corps) : corps), tete, zone }
}
