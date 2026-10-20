import type { Match, Stat } from './types.ts'

const POINTS: Partial<Record<Stat, number>> = { tir2: 2, tir3: 3, lf: 1 }

export const scoreNous = (m: Match) => m.evenements.reduce((s, e) => s + (POINTS[e.stat] ?? 0), 0)
export const scoreAdverse = (m: Match) => m.adverses.reduce((s, a) => s + a.points, 0)

export const nomQuart = (q: number) => (q <= 4 ? `Q${q}` : q === 5 ? 'Prol.' : `Prol. ${q - 4}`)

export function scoreParQuart(m: Match) {
  const quarts = [...new Set([...m.evenements.map((e) => e.quart), ...m.adverses.map((a) => a.quart)])].sort((a, b) => a - b)
  return quarts.map((quart) => ({
    quart,
    nous: m.evenements.filter((e) => e.quart === quart).reduce((s, e) => s + (POINTS[e.stat] ?? 0), 0),
    eux: m.adverses.filter((a) => a.quart === quart).reduce((s, a) => s + a.points, 0),
  }))
}

export interface Ligne {
  pts: number
  tir2: [number, number] // réussis, tentés
  tir3: [number, number]
  lf: [number, number]
  rebOff: number
  rebDef: number
  rebonds: number
  passes: number
  interceptions: number
  contres: number
  pertes: number
  fautes: number
}

export function feuille(m: Match, joueur: string): Ligne {
  const c = (s: Stat) => m.evenements.filter((e) => e.joueur === joueur && e.stat === s).length
  const [rebOff, rebDef] = [c('rebOff'), c('rebDef')]
  return {
    pts: 2 * c('tir2') + 3 * c('tir3') + c('lf'),
    tir2: [c('tir2'), c('tir2') + c('tir2rate')],
    tir3: [c('tir3'), c('tir3') + c('tir3rate')],
    lf: [c('lf'), c('lf') + c('lfrate')],
    rebOff, rebDef, rebonds: rebOff + rebDef,
    passes: c('passe'), interceptions: c('interception'), contres: c('contre'), pertes: c('perte'), fautes: c('faute'),
  }
}

// Moyennes par match, sur les matchs où le joueur était présent.
export function saison(matchs: Match[], joueur: string) {
  const joues = matchs.filter((m) => m.presents.includes(joueur))
  const lignes = joues.map((m) => feuille(m, joueur))
  const somme = (f: (l: Ligne) => number) => lignes.reduce((s, l) => s + f(l), 0)
  const moyenne = (f: (l: Ligne) => number) => (joues.length ? Math.round((somme(f) / joues.length) * 10) / 10 : 0)
  const [lfReussis, lfTentes] = [somme((l) => l.lf[0]), somme((l) => l.lf[1])]
  return {
    matchs: joues.length,
    moyennes: {
      pts: moyenne((l) => l.pts), rebonds: moyenne((l) => l.rebonds), passes: moyenne((l) => l.passes),
      interceptions: moyenne((l) => l.interceptions), pertes: moyenne((l) => l.pertes), fautes: moyenne((l) => l.fautes),
    },
    pourcentageLf: lfTentes ? Math.round((100 * lfReussis) / lfTentes) : null,
  }
}
