import { describe, expect, it } from 'vitest'
import { ballonsFinaux, changerChemin, changerNumero, deplacerJoueur, etapeSuivante, positionsFinales, propager, retirerJoueur } from './etapes.ts'
import { nouveauDocument } from './documents.ts'
import type { Action, Etape, Joueur, Point, TypeAction } from './types.ts'

const j = (id: string, x: number, y: number): Joueur =>
  ({ id, camp: id[0] === 'A' ? 'attaque' : 'defense', numero: Number(id.slice(1)), x, y })
let n = 0
const act = (type: TypeAction, joueur: string, chemin: Point[], vers?: string): Action =>
  ({ id: `a${n++}`, type, joueur, chemin, couleur: '#222', ...(vers ? { vers } : {}) })
const etape = (joueurs: Joueur[], actions: Action[] = [], ballons: string[] = []): Etape =>
  ({ id: 'e', description: 'desc', joueurs, ballons, actions, textes: [{ id: 't', x: 1, y: 1, texte: 'x' }] })
const pos = (e: Etape, id: string) => { const k = e.joueurs.find((p) => p.id === id)!; return [k.x, k.y] }

describe('positionsFinales', () => {
  it('place chaque joueur au bout de sa dernière coupe, dribble ou écran ; les autres restent', () => {
    const e = etape([j('A1', 9, 7.5), j('A2', 5, 2), j('A3', 3, 12)], [
      act('coupe', 'A1', [[9, 7.5], [7, 6], [5, 5]]),
      act('coupe', 'A3', [[3, 12], [3, 11], [3, 10]]),
      act('ecran', 'A3', [[3, 10], [4, 9], [5, 8]]),
      act('passe', 'A2', [[5, 2], [5, 3], [5, 5]], 'A1'),
    ])
    const f = positionsFinales(e)
    expect(f.get('A1')).toEqual([5, 5])
    expect(f.get('A2')).toEqual([5, 2])
    expect(f.get('A3')).toEqual([5, 8])
  })
})

describe('ballonsFinaux', () => {
  const joueurs = [j('A1', 9, 7.5), j('A2', 5, 2), j('A3', 5, 13), j('A4', 2, 7)]
  it('donne le ballon au receveur de chaque passe, sinon il reste au porteur', () => {
    expect(ballonsFinaux(etape(joueurs, [], ['A1']))).toEqual(['A1'])
    expect(ballonsFinaux(etape(joueurs, [act('dribble', 'A1', [[9, 7.5], [8, 7], [7, 7]])], ['A1']))).toEqual(['A1'])
    expect(ballonsFinaux(etape(joueurs, [
      act('passe', 'A1', [[9, 7.5], [7, 5], [5, 2]], 'A2'),
      act('passe', 'A2', [[5, 2], [5, 7], [5, 13]], 'A3'),
    ], ['A1']))).toEqual(['A3'])
  })
  it('gère plusieurs ballons, et une passe tracée depuis un joueur sans ballon en donne un au receveur', () => {
    const deux = ballonsFinaux(etape(joueurs, [act('passe', 'A1', [[9, 7.5], [7, 5], [5, 2]], 'A2')], ['A1', 'A3']))
    expect([...deux].sort()).toEqual(['A2', 'A3'])
    expect(ballonsFinaux(etape(joueurs, [act('passe', 'A1', [[9, 7.5], [7, 5], [5, 2]], 'A2')]))).toEqual(['A2'])
  })
})

describe('etapeSuivante', () => {
  it('repart des positions et du ballon de fin d’étape, sans actions ni textes', () => {
    const e = etape([j('A1', 9, 7.5), j('A2', 5, 2), j('D1', 8, 7.5)], [
      act('dribble', 'A1', [[9, 7.5], [8, 5], [7, 3]]),
      act('passe', 'A1', [[7, 3], [6, 2], [5, 2]], 'A2'),
    ], ['A1'])
    const s = etapeSuivante(e)
    expect(s.id).not.toBe(e.id)
    expect(pos(s, 'A1')).toEqual([7, 3])
    expect(pos(s, 'A2')).toEqual([5, 2])
    expect(pos(s, 'D1')).toEqual([8, 7.5])
    expect(s.ballons).toEqual(['A2'])
    expect(s.actions).toEqual([])
    expect(s.textes).toEqual([])
    expect(s.description).toBe('')
  })
})

describe('deplacerJoueur', () => {
  it('emmène le départ de ses actions et l’arrivée des passes qui lui sont destinées', () => {
    const e = etape([j('A1', 9, 7.5), j('A2', 5, 2)], [
      act('coupe', 'A1', [[9, 7.5], [8, 6], [7, 5]]),
      act('passe', 'A2', [[5, 2], [6, 4], [7, 5]], 'A1'),
      act('passe', 'A1', [[9, 7.5], [7, 5], [5, 2]], 'A2'),
    ])
    const d = deplacerJoueur(e, 'A2', [4, 3])
    expect(pos(d, 'A2')).toEqual([4, 3])
    expect(d.actions[1].chemin[0]).toEqual([4, 3])
    expect(d.actions[2].chemin.at(-1)).toEqual([4, 3])
    expect(d.actions[0]).toEqual(e.actions[0])
  })
})

describe('changerChemin', () => {
  it('fait suivre la passe vers ce joueur et son action enchaînée quand on déplace l’arrivée d’une coupe', () => {
    const e = etape([j('A1', 9, 7.5), j('A2', 5, 2)], [
      act('coupe', 'A2', [[5, 2], [4, 2.5], [3, 3]]),
      act('ecran', 'A2', [[3, 3], [3.5, 4], [4, 5]]),
      act('passe', 'A1', [[9, 7.5], [7, 6], [4, 5]], 'A2'),
    ])
    const c = changerChemin(e, e.actions[0].id, [[5, 2], [4, 2], [2, 2]])
    expect(c.actions[0].chemin.at(-1)).toEqual([2, 2])
    expect(c.actions[1].chemin[0]).toEqual([2, 2])
    expect(c.actions[2].chemin.at(-1)).toEqual([4, 5])
    const d = changerChemin(e, e.actions[1].id, [[3, 3], [3.5, 4], [6, 6]])
    expect(d.actions[2].chemin.at(-1)).toEqual([6, 6])
  })
})

describe('changerNumero', () => {
  it('change le numéro dans toutes les étapes et le donne en échange à celui qui l’avait (même camp)', () => {
    const e1 = etape([j('A1', 9, 7.5), j('A2', 5, 2), j('D2', 5, 3)])
    const s = { ...nouveauDocument('systeme', 'x', { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 }, 'Attaque'), etapes: [e1, etapeSuivante(e1)] }
    const r = changerNumero(s, 'A2', 1)
    for (const e of r.etapes) {
      expect(e.joueurs.find((p) => p.id === 'A2')!.numero).toBe(1)
      expect(e.joueurs.find((p) => p.id === 'A1')!.numero).toBe(2)
      expect(e.joueurs.find((p) => p.id === 'D2')!.numero).toBe(2)
    }
  })
})

describe('retirerJoueur', () => {
  it('retire le joueur, ses actions, les passes vers lui et le ballon', () => {
    const e = etape([j('A1', 9, 7.5), j('A2', 5, 2)], [
      act('coupe', 'A1', [[9, 7.5], [8, 6], [7, 5]]),
      act('passe', 'A2', [[5, 2], [6, 4], [7, 5]], 'A1'),
    ], ['A1'])
    const r = retirerJoueur(e, 'A1')
    expect(r.joueurs.map((p) => p.id)).toEqual(['A2'])
    expect(r.actions).toEqual([])
    expect(r.ballons).toEqual([])
  })
})

describe('propager', () => {
  // Étape 1 : A1 coupe, A2 coupe, A3 coupe, passe A1 → A2. Étape 2 : A2 déplacé à la main, A1 coupe encore.
  const fabriquer = () => {
    const e1 = etape([j('A1', 9, 7.5), j('A2', 5, 2), j('A3', 3, 12)], [
      act('coupe', 'A1', [[9, 7.5], [7, 6], [5, 5]]),
      act('coupe', 'A2', [[5, 2], [4, 3], [3, 3]]),
      act('coupe', 'A3', [[3, 12], [5, 10], [7, 7]]),
      act('passe', 'A1', [[9, 7.5], [6, 5], [3, 3]], 'A2'),
    ], ['A1'])
    let e2 = deplacerJoueur(etapeSuivante(e1), 'A2', [2, 2])
    e2 = { ...e2, actions: [act('coupe', 'A1', [[5, 5], [5.5, 5.5], [6, 6]])] }
    const e3 = etapeSuivante(e2)
    return [e1, e2, e3]
  }
  const modifier = (etapes: Etape[], i: number, f: (e: Etape) => Etape) => {
    const avant = etapes[i]
    const copie = [...etapes]
    copie[i] = f(avant)
    return propager(copie, i, avant)
  }
  const finDe = (e: Etape, idx: number, p: Point): Etape =>
    ({ ...e, actions: e.actions.map((a, k) => (k === idx ? { ...a, chemin: [...a.chemin.slice(0, -1), p] } : a)) })

  it('déplace à l’étape suivante les joueurs placés automatiquement, avec le départ de leurs actions', () => {
    const r = modifier(fabriquer(), 0, (e) => finDe(e, 0, [4, 4]))
    expect(pos(r[1], 'A1')).toEqual([4, 4])
    expect(r[1].actions[0].chemin[0]).toEqual([4, 4])
    expect(pos(r[2], 'A1')).toEqual([6, 6])
  })

  it('laisse en place un joueur déplacé à la main', () => {
    const r = modifier(fabriquer(), 0, (e) => finDe(e, 1, [3.5, 3.5]))
    expect(pos(r[1], 'A2')).toEqual([2, 2])
  })

  it('descend en cascade sur toutes les étapes suivantes', () => {
    const r = modifier(fabriquer(), 0, (e) => finDe(e, 2, [8, 8]))
    expect(pos(r[1], 'A3')).toEqual([8, 8])
    expect(pos(r[2], 'A3')).toEqual([8, 8])
  })

  it('propage le ballon quand le receveur change', () => {
    const r = modifier(fabriquer(), 0, (e) => ({ ...e, actions: e.actions.map((a) => (a.type === 'passe' ? { ...a, vers: 'A3' } : a)) }))
    expect(r[1].ballons).toEqual(['A3'])
    expect(r[2].ballons).toEqual(['A3'])
  })

  it('ajoute et retire dans les étapes suivantes les joueurs ajoutés ou supprimés', () => {
    const ajout = modifier(fabriquer(), 0, (e) => ({ ...e, joueurs: [...e.joueurs, j('D1', 8, 7)] }))
    expect(pos(ajout[1], 'D1')).toEqual([8, 7])
    expect(pos(ajout[2], 'D1')).toEqual([8, 7])
    const retrait = modifier(fabriquer(), 0, (e) => retirerJoueur(e, 'A3'))
    expect(retrait[1].joueurs.some((p) => p.id === 'A3')).toBe(false)
    expect(retrait[2].joueurs.some((p) => p.id === 'A3')).toBe(false)
  })

  it('ne touche à rien si les fins d’étape ne changent pas', () => {
    const etapes = fabriquer()
    const r = modifier(etapes, 0, (e) => ({ ...e, description: 'autre' }))
    expect(r[1]).toBe(etapes[1])
    expect(r[2]).toBe(etapes[2])
  })
})
