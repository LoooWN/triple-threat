import type { Etape, Systeme } from './types.ts'

// Gauche-droite : y → largeur − y.
export function miroirEtape(e: Etape, largeur: number): Etape {
  return {
    ...e,
    joueurs: e.joueurs.map((j) => ({ ...j, y: largeur - j.y })),
    actions: e.actions.map((a) => ({ ...a, chemin: a.chemin.map(([x, y]) => [x, largeur - y]) })),
    textes: e.textes.map((t) => ({ ...t, y: largeur - t.y })),
  }
}

export const miroirSysteme = (s: Systeme): Systeme => ({
  ...s,
  etapes: s.etapes.map((e) => miroirEtape(e, s.terrain.largeur)),
  materiel: s.materiel.map((m) => ({ ...m, y: s.terrain.largeur - m.y, angle: -m.angle })),
})
