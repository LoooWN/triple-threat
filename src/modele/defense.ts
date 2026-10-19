import { distance } from './geometrie.ts'
import type { Etape, Joueur, Point, Terrain } from './types.ts'

export const PANIER_X = 1.575

// Un défenseur par attaquant qui n'en a pas : à 1 m de lui, sur la ligne qui va au panier attaqué.
export function placerDefense(e: Etape, terrain: Terrain): Etape {
  const panier: Point = [PANIER_X, terrain.largeur / 2]
  const nouveaux: Joueur[] = e.joueurs
    .filter((a) => a.camp === 'attaque' && !e.joueurs.some((d) => d.camp === 'defense' && d.numero === a.numero))
    .map((a) => {
      const d = distance([a.x, a.y], panier)
      const k = d > 0 ? Math.min(1, d / 2) / d : 0
      const x = Math.round((a.x + (panier[0] - a.x) * k) * 100) / 100
      const y = Math.round((a.y + (panier[1] - a.y) * k) * 100) / 100
      return { id: `D${a.numero}`, camp: 'defense', numero: a.numero, x, y }
    })
  return { ...e, joueurs: [...e.joueurs, ...nouveaux] }
}
