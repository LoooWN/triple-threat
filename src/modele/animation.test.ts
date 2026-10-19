import { describe, expect, it } from 'vitest'
import { etatAnime, nombreTemps } from './animation.ts'
import { distance } from './geometrie.ts'
import type { Action, Etape, Point } from './types.ts'

const joueurs: Etape['joueurs'] = [
  { id: 'A1', camp: 'attaque', numero: 1, x: 9, y: 7.5 },
  { id: 'A2', camp: 'attaque', numero: 2, x: 5, y: 2 },
  { id: 'A3', camp: 'attaque', numero: 3, x: 5, y: 13 },
  { id: 'A5', camp: 'attaque', numero: 5, x: 5.8, y: 10 },
  { id: 'D1', camp: 'defense', numero: 1, x: 8, y: 7.5 },
]
const act = (id: string, type: Action['type'], joueur: string, chemin: Point[], vers?: string): Action =>
  ({ id, type, joueur, chemin, couleur: '#000', ...(vers ? { vers } : {}) })
const etape = (actions: Action[]): Etape => ({ id: 'e', description: '', ballon: 'A1', textes: [], joueurs, actions })
const pres = (p: Point | null | undefined, q: Point) => distance(p!, q) < 0.01

describe('etatAnime', () => {
  it('fait tout partir en même temps : coupe, écran et passe vers le coupeur', () => {
    const e = etape([
      act('c2', 'coupe', 'A2', [[5, 2], [4, 3], [3, 4]]),
      act('e5', 'ecran', 'A5', [[5.8, 10], [7, 9], [8, 8]]),
      act('p1', 'passe', 'A1', [[9, 7.5], [6, 5], [3, 4]], 'A2'),
    ])
    expect(nombreTemps(e)).toBe(1)
    const debut = etatAnime(e, 0)
    expect(debut.positions.get('A2')).toEqual([5, 2])
    expect(debut.ballon).toEqual([9, 7.5])
    const milieu = etatAnime(e, 0.5)
    expect(pres(milieu.positions.get('A2'), [5, 2]) || pres(milieu.positions.get('A2'), [3, 4])).toBe(false)
    expect(pres(milieu.positions.get('A5'), [5.8, 10]) || pres(milieu.positions.get('A5'), [8, 8])).toBe(false)
    expect(pres(milieu.ballon, [9, 7.5]) || pres(milieu.ballon, [3, 4])).toBe(false)
    const fin = etatAnime(e, 1)
    expect(pres(fin.positions.get('A2'), [3, 4])).toBe(true)
    expect(pres(fin.ballon, [3, 4])).toBe(true)
    expect(fin.positions.get('D1')).toEqual([8, 7.5])
  })

  it('enchaîne les actions d’un même joueur : dribble puis passe', () => {
    const e = etape([
      act('d1', 'dribble', 'A1', [[9, 7.5], [8, 6], [7, 5]]),
      act('c3', 'coupe', 'A3', [[5, 13], [4, 12], [3, 11]]),
      act('p1', 'passe', 'A1', [[7, 5], [5, 4], [3, 11]], 'A3'),
    ])
    expect(nombreTemps(e)).toBe(2)
    const s = etatAnime(e, 0.5)
    expect(pres(s.positions.get('A1'), [7, 5])).toBe(true)
    expect(pres(s.positions.get('A3'), [3, 11])).toBe(true)
    expect(pres(s.ballon, [7, 5])).toBe(true)
    expect(pres(etatAnime(e, 1).ballon, [3, 11])).toBe(true)
  })

  it('attend que le ballon arrive avant une deuxième passe', () => {
    const e = etape([
      act('p1', 'passe', 'A1', [[9, 7.5], [7, 4], [5, 2]], 'A2'),
      act('p2', 'passe', 'A2', [[5, 2], [5, 7], [5, 13]], 'A3'),
    ])
    expect(nombreTemps(e)).toBe(2)
    expect(pres(etatAnime(e, 0.5).ballon, [5, 2])).toBe(true)
    expect(pres(etatAnime(e, 1).ballon, [5, 13])).toBe(true)
  })
})
