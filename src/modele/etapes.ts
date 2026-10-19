import { deplacerDebut, deplacerFin, fin, proche } from './geometrie.ts'
import { nouvelId, type Action, type Etape, type Point } from './types.ts'

export const estDeplacement = (a: Action) => a.type !== 'passe'

// Où chaque joueur se trouve à la fin de l'étape : au bout de sa dernière coupe, dribble ou écran.
export function positionsFinales(e: Etape): Map<string, Point> {
  const pos = new Map(e.joueurs.map((j) => [j.id, [j.x, j.y] as Point]))
  for (const a of e.actions) if (estDeplacement(a) && pos.has(a.joueur)) pos.set(a.joueur, fin(a.chemin))
  return pos
}

export function ballonFinal(e: Etape): string | null {
  const passes = e.actions.filter((a) => a.type === 'passe' && a.vers)
  return passes.length ? passes[passes.length - 1].vers! : e.ballon
}

export function etapeSuivante(e: Etape): Etape {
  const pos = positionsFinales(e)
  return {
    id: nouvelId('e'),
    description: '',
    joueurs: e.joueurs.map((j) => ({ ...j, x: pos.get(j.id)![0], y: pos.get(j.id)![1] })),
    ballon: ballonFinal(e),
    actions: [],
    textes: [],
  }
}

export function deplacerJoueur(e: Etape, id: string, p: Point): Etape {
  const j = e.joueurs.find((k) => k.id === id)
  if (!j) return e
  const avant: Point = [j.x, j.y]
  const finAvant = positionsFinales(e).get(id)!
  const joueurs = e.joueurs.map((k) => (k.id === id ? { ...k, x: p[0], y: p[1] } : k))
  let actions = e.actions.map((a) =>
    a.joueur === id && proche(a.chemin[0], avant) ? { ...a, chemin: deplacerDebut(a.chemin, p) } : a)
  const finApres = positionsFinales({ ...e, joueurs, actions }).get(id)!
  if (!proche(finAvant, finApres))
    actions = actions.map((a) =>
      a.type === 'passe' && a.vers === id && proche(fin(a.chemin), finAvant) ? { ...a, chemin: deplacerFin(a.chemin, finApres) } : a)
  return { ...e, joueurs, actions }
}

export function retirerJoueur(e: Etape, id: string): Etape {
  return {
    ...e,
    joueurs: e.joueurs.filter((j) => j.id !== id),
    actions: e.actions.filter((a) => a.joueur !== id && a.vers !== id),
    ballon: e.ballon === id ? null : e.ballon,
  }
}

// L'étape i vient d'être modifiée (son ancienne version : `avant`) : les étapes suivantes suivent,
// sauf pour les joueurs que le coach a déplacés à la main.
export function propager(etapes: Etape[], i: number, avant: Etape): Etape[] {
  const res = [...etapes]
  let ancienne = avant
  for (let k = i + 1; k < res.length; k++) {
    const finAvant = positionsFinales(ancienne)
    const finApres = positionsFinales(res[k - 1])
    let suivante = res[k]
    for (const [id, pa] of finAvant) {
      const pn = finApres.get(id)
      const j = suivante.joueurs.find((x) => x.id === id)
      if (!j) continue
      if (!pn) suivante = retirerJoueur(suivante, id)
      else if (!proche(pa, pn) && proche([j.x, j.y], pa)) suivante = deplacerJoueur(suivante, id, pn)
    }
    for (const [id, pn] of finApres) {
      const nouveau = res[k - 1].joueurs.find((x) => x.id === id)!
      if (!finAvant.has(id) && !suivante.joueurs.some((x) => x.id === id))
        suivante = { ...suivante, joueurs: [...suivante.joueurs, { ...nouveau, x: pn[0], y: pn[1] }] }
    }
    const [ba, bn] = [ballonFinal(ancienne), ballonFinal(res[k - 1])]
    if (ba !== bn && suivante.ballon === ba) suivante = { ...suivante, ballon: bn }
    if (suivante === res[k]) break
    ancienne = res[k]
    res[k] = suivante
  }
  return res
}
