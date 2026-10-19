import { estDeplacement } from './etapes.ts'
import { fin, pointA, polyligne } from './geometrie.ts'
import type { Etape, Point } from './types.ts'

// Tout part en même temps. Un joueur enchaîne seulement ses propres actions (dans l'ordre du tracé),
// et ne passe ou ne dribble qu'une fois qu'il a le ballon. Renvoie le « temps » de départ de chaque action.
export function temps(e: Etape): Map<string, number> {
  const libre = new Map<string, number>()
  const aLeBallon = new Map<string, number>(e.ballons.map((b) => [b, 0]))
  const depart = new Map<string, number>()
  for (const a of e.actions) {
    let k = libre.get(a.joueur) ?? 0
    if (a.type === 'passe' || a.type === 'dribble') k = Math.max(k, aLeBallon.get(a.joueur) ?? 0)
    depart.set(a.id, k)
    libre.set(a.joueur, k + 1)
    if (a.type === 'passe' && a.vers) aLeBallon.set(a.vers, k + 1)
  }
  return depart
}

export const nombreTemps = (e: Etape) => Math.max(1, ...[...temps(e).values()].map((k) => k + 1))

export function etatAnime(e: Etape, t: number): { positions: Map<string, Point>; ballons: Point[] } {
  const depart = temps(e)
  const u = Math.min(1, Math.max(0, t)) * nombreTemps(e) // avancement en « temps »
  const positions = new Map<string, Point>()
  for (const j of e.joueurs) {
    let p: Point = [j.x, j.y]
    for (const a of e.actions) {
      if (a.joueur !== j.id || !estDeplacement(a)) continue
      const k = depart.get(a.id)!
      if (u >= k + 1) p = fin(a.chemin)
      else {
        if (u > k) p = pointA(polyligne(a.chemin), u - k)
        break
      }
    }
    positions.set(j.id, p)
  }
  const porteurs = new Set(e.ballons)
  const enVol: Point[] = []
  for (const a of e.actions) {
    if (a.type !== 'passe' || !a.vers) continue
    const k = depart.get(a.id)!
    if (u <= k) continue
    porteurs.delete(a.joueur)
    if (u >= k + 1) porteurs.add(a.vers)
    else enVol.push(pointA(polyligne(a.chemin), u - k))
  }
  const tenus = [...porteurs].map((id) => positions.get(id)).filter((p): p is Point => !!p)
  return { positions, ballons: [...tenus, ...enVol] }
}
