import { describe, expect, it } from 'vitest'
import { etatAnime } from './animation.ts'
import { distance } from './geometrie.ts'
import type { Etape } from './types.ts'

const e: Etape = {
  id: 'e', description: '', ballon: 'A1', textes: [],
  joueurs: [
    { id: 'A1', camp: 'attaque', numero: 1, x: 9, y: 7.5 },
    { id: 'A2', camp: 'attaque', numero: 2, x: 5, y: 2 },
    { id: 'D1', camp: 'defense', numero: 1, x: 8, y: 7.5 },
  ],
  actions: [
    { id: 'a1', type: 'dribble', joueur: 'A1', chemin: [[9, 7.5], [8, 6], [7, 5]], couleur: '#000' },
    { id: 'a2', type: 'coupe', joueur: 'A2', chemin: [[5, 2], [4, 3], [3, 4]], couleur: '#000' },
    { id: 'a3', type: 'passe', joueur: 'A1', vers: 'A2', chemin: [[7, 5], [5, 4.5], [3, 4]], couleur: '#000' },
  ],
}

describe('etatAnime', () => {
  it('part des positions de départ, avec le ballon dans les mains du porteur', () => {
    const s = etatAnime(e, 0)
    expect(s.positions.get('A1')).toEqual([9, 7.5])
    expect(s.ballon).toEqual([9, 7.5])
  })
  it('finit les déplacements avant de lancer la passe', () => {
    const s = etatAnime(e, 0.65)
    expect(distance(s.positions.get('A1')!, [7, 5])).toBeLessThan(0.01)
    expect(distance(s.ballon!, [7, 5])).toBeLessThan(0.01)
  })
  it('arrive aux positions de fin d’étape, ballon chez le receveur ; un joueur sans action ne bouge pas', () => {
    const s = etatAnime(e, 1)
    expect(distance(s.positions.get('A2')!, [3, 4])).toBeLessThan(0.01)
    expect(distance(s.ballon!, [3, 4])).toBeLessThan(0.01)
    expect(s.positions.get('D1')).toEqual([8, 7.5])
  })
})
