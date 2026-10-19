import { deplacerDebut, deplacerFin, distance, fin, proche } from './geometrie.ts'
import { nouvelId, type Action, type Etape, type Point, type Systeme } from './types.ts'

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

// Les passes restent accrochées à leur receveur quand sa position de fin d'étape change.
function suivrePasses(avant: Etape, apres: Etape): Etape {
  const [fa, fn] = [positionsFinales(avant), positionsFinales(apres)]
  return {
    ...apres,
    actions: apres.actions.map((a) => {
      const [pa, pn] = [a.vers && fa.get(a.vers), a.vers && fn.get(a.vers)]
      if (a.type !== 'passe' || !pa || !pn || proche(pa, pn)) return a
      return { ...a, chemin: deplacerFin(a.chemin, pn) }
    }),
  }
}

export function deplacerJoueur(e: Etape, id: string, p: Point): Etape {
  const j = e.joueurs.find((k) => k.id === id)
  if (!j) return e
  const avant: Point = [j.x, j.y]
  return suivrePasses(e, {
    ...e,
    joueurs: e.joueurs.map((k) => (k.id === id ? { ...k, x: p[0], y: p[1] } : k)),
    actions: e.actions.map((a) => (a.joueur === id && proche(a.chemin[0], avant) ? { ...a, chemin: deplacerDebut(a.chemin, p) } : a)),
  })
}

// Nouveau tracé pour une action : son action enchaînée (même joueur) et les passes vers ce joueur suivent.
export function changerChemin(e: Etape, id: string, chemin: Point[]): Etape {
  const a = e.actions.find((x) => x.id === id)
  if (!a) return e
  const [ancien, nouveau] = [fin(a.chemin), fin(chemin)]
  const suit = estDeplacement(a) && !proche(ancien, nouveau)
  return suivrePasses(e, {
    ...e,
    actions: e.actions.map((x) => {
      if (x.id === id) return { ...x, chemin }
      return suit && x.joueur === a.joueur && proche(x.chemin[0], ancien) ? { ...x, chemin: deplacerDebut(x.chemin, nouveau) } : x
    }),
  })
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

// Un trait part d'un joueur, ou du bout de sa dernière coupe / dribble / écran (pour enchaîner).
// Un trait commencé sur un joueur (rayon du pion) lui appartient toujours.
export function attacherTrait(e: Etape, chemin: Point[]): { joueur: string; chemin: Point[] } | null {
  const plusProche = (ancres: { joueur: string; ancre: Point }[], rayon: number) => {
    const d = (x: { ancre: Point }) => distance(x.ancre, chemin[0])
    return ancres.filter((x) => d(x) < rayon).sort((a, b) => d(a) - d(b))[0]
  }
  const pions = e.joueurs.map((j) => ({ joueur: j.id, ancre: [j.x, j.y] as Point }))
  const bouts = e.actions.filter(estDeplacement).map((a) => ({ joueur: a.joueur, ancre: fin(a.chemin) }))
  const choix = plusProche(pions, 0.6) ?? plusProche([...pions, ...bouts], 1.2)
  return choix ? { joueur: choix.joueur, chemin: deplacerDebut(chemin, choix.ancre) } : null
}

// Change le numéro d'un joueur dans tout le système ; celui du même camp qui l'avait prend l'ancien.
export function changerNumero(s: Systeme, id: string, numero: number): Systeme {
  const j = s.etapes.flatMap((e) => e.joueurs).find((x) => x.id === id)
  if (!j || j.numero === numero) return s
  return {
    ...s,
    etapes: s.etapes.map((e) => ({
      ...e,
      joueurs: e.joueurs.map((x) =>
        x.id === id ? { ...x, numero } : x.camp === j.camp && x.numero === numero ? { ...x, numero: j.numero } : x),
    })),
  }
}

// Une passe va à l'attaquant le plus proche de son arrivée, là où il sera en fin d'étape.
export function receveurPasse(e: Etape, passeur: string, chemin: Point[]): { vers: string; chemin: Point[] } | null {
  const finales = positionsFinales(e)
  let meilleur: { vers: string; p: Point; d: number } | null = null
  for (const j of e.joueurs) {
    if (j.id === passeur || j.camp !== 'attaque') continue
    const p = finales.get(j.id)!
    const d = distance(p, fin(chemin))
    if (d < 2.5 && (!meilleur || d < meilleur.d)) meilleur = { vers: j.id, p, d }
  }
  return meilleur && { vers: meilleur.vers, chemin: deplacerFin(chemin, meilleur.p) }
}
