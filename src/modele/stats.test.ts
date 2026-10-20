import { describe, expect, it } from 'vitest'
import { feuille, nomQuart, saison, scoreAdverse, scoreNous, scoreParQuart } from './stats.ts'
import type { Evenement, Match, Stat } from './types.ts'

let n = 0
const ev = (joueur: string, stat: Stat, quart = 1): Evenement => ({ id: `e${n++}`, joueur, stat, quart })
const match = (evenements: Evenement[], adverses: [number, number][] = [], presents = ['j1', 'j2']): Match => ({
  id: `m${n++}`, equipe: 'eq', adversaire: 'Lyon', date: '2026-10-25', presents, evenements, quart: 1, creeLe: '', modifieLe: '',
  adverses: adverses.map(([quart, points], k) => ({ id: `a${k}`, quart, points })),
})

describe('statistiques de match', () => {
  const m = match([
    ev('j1', 'tir2'), ev('j1', 'tir2rate'), ev('j1', 'tir3', 2), ev('j1', 'lf', 2), ev('j1', 'lfrate', 2),
    ev('j1', 'rebDef'), ev('j1', 'faute'), ev('j2', 'passe'), ev('j2', 'rebOff', 2), ev('j2', 'perte'), ev('j2', 'tir2', 2),
  ], [[1, 2], [1, 3], [2, 2]])

  it('calcule le score des deux équipes et le score par quart-temps', () => {
    expect(scoreNous(m)).toBe(8)
    expect(scoreAdverse(m)).toBe(7)
    expect(scoreParQuart(m)).toEqual([{ quart: 1, nous: 2, eux: 5 }, { quart: 2, nous: 6, eux: 2 }])
  })

  it('remplit la feuille de match d’un joueur', () => {
    expect(feuille(m, 'j1')).toEqual({
      pts: 6, tir2: [1, 2], tir3: [1, 1], lf: [1, 2], rebOff: 0, rebDef: 1, rebonds: 1,
      passes: 0, interceptions: 0, contres: 0, pertes: 0, fautes: 1,
    })
    expect(feuille(m, 'j2')).toMatchObject({ pts: 2, rebOff: 1, rebonds: 1, passes: 1, pertes: 1 })
  })

  it('fait les moyennes de saison sur les matchs où le joueur était présent', () => {
    const m2 = match([ev('j1', 'tir3'), ev('j1', 'rebOff'), ev('j1', 'rebOff')])
    const absent = match([], [], ['j2'])
    const s = saison([m, m2, absent], 'j1')
    expect(s.matchs).toBe(2)
    expect(s.moyennes.pts).toBe(4.5)
    expect(s.moyennes.rebonds).toBe(1.5)
    expect(s.pourcentageLf).toBe(50)
  })

  it('nomme les quarts-temps et les prolongations', () => {
    expect([1, 4, 5, 6].map(nomQuart)).toEqual(['Q1', 'Q4', 'Prol.', 'Prol. 2'])
  })
})
