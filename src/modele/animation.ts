import { estDeplacement } from './etapes.ts'
import { pointA, polyligne } from './geometrie.ts'
import type { Etape, Point } from './types.ts'

// Dans une étape, les déplacements se jouent ensemble, puis les passes partent une par une.
export const PART_DEPLACEMENTS = 0.65

export function etatAnime(e: Etape, t: number): { positions: Map<string, Point>; ballon: Point | null } {
  const passes = e.actions.filter((a) => a.type === 'passe' && a.vers)
  const td = passes.length ? Math.min(1, t / PART_DEPLACEMENTS) : t
  const positions = new Map<string, Point>()
  for (const j of e.joueurs) {
    const trajet: Point[] = [[j.x, j.y]]
    for (const a of e.actions) if (a.joueur === j.id && estDeplacement(a)) trajet.push(...polyligne(a.chemin))
    positions.set(j.id, trajet.length > 1 ? pointA(trajet, td) : trajet[0])
  }
  if (!passes.length || t <= PART_DEPLACEMENTS) return { positions, ballon: (e.ballon && positions.get(e.ballon)) || null }
  const f = ((Math.min(1, t) - PART_DEPLACEMENTS) / (1 - PART_DEPLACEMENTS)) * passes.length
  const k = Math.min(passes.length - 1, Math.floor(f))
  return { positions, ballon: pointA(polyligne(passes[k].chemin), f - k) }
}
