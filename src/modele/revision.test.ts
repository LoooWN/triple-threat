import { describe, expect, it } from 'vitest'
import { nouveauDocument } from './documents.ts'
import { aRetravailler, campActif, dernierResultat, postes, questionsPour, verifier } from './revision.ts'
import type { Action, Joueur, Point, Systeme } from './types.ts'

const j = (id: string, x: number, y: number): Joueur =>
  ({ id, camp: id[0] === 'A' ? 'attaque' : 'defense', numero: Number(id.slice(1)), x, y })
const act = (id: string, type: Action['type'], joueur: string, chemin: Point[], vers?: string): Action =>
  ({ id, type, joueur, chemin, couleur: '#000', ...(vers ? { vers } : {}) })
const terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 } as const

// Étape 1 : le 1 dribble puis passe au 2 qui coupe ; le 3 ne bouge pas. Étape 2 : le 3 fait un écran.
const systeme = (): Systeme => ({
  ...nouveauDocument('systeme', 'Corne', terrain, 'Attaque'),
  etapes: [
    {
      id: 'e1', description: '', ballons: ['A1'], textes: [],
      joueurs: [j('A1', 9, 7.5), j('A2', 5, 2), j('A3', 5, 13), j('D1', 8, 7.5)],
      actions: [
        act('d', 'dribble', 'A1', [[9, 7.5], [8.5, 6], [8, 5]]),
        act('c', 'coupe', 'A2', [[5, 2], [4, 3], [3, 4]]),
        act('p', 'passe', 'A1', [[8, 5], [5, 4], [3, 4]], 'A2'),
      ],
    },
    {
      id: 'e2', description: '', ballons: ['A2'], textes: [],
      joueurs: [j('A1', 8, 5), j('A2', 3, 4), j('A3', 5, 13), j('D1', 8, 7.5)],
      actions: [act('s', 'ecran', 'A3', [[5, 13], [4, 11], [3.5, 9]])],
    },
  ],
})

describe('questionsPour', () => {
  it('en mode poste : que fait-il, où va-t-il, à qui passe-t-il, et « ne bouge pas » quand il ne fait rien', () => {
    expect(questionsPour(systeme(), 1)).toEqual([
      { type: 'quoi', etape: 0, joueur: 'A1', reponse: 'dribble' },
      { type: 'ou', etape: 0, joueur: 'A1', cible: [8, 5] },
      { type: 'qui', etape: 0, joueur: 'A1', reponse: 'A2' },
      { type: 'quoi', etape: 1, joueur: 'A1', reponse: 'rien' },
    ])
  })
  it('en mode « tous les postes » : seulement les joueurs qui ont une action, dans l’ordre des numéros', () => {
    const q = questionsPour(systeme(), null)
    expect(q.map((x) => `${x.etape}${x.joueur}${x.type}`)).toEqual(['0A1quoi', '0A1ou', '0A1qui', '0A2quoi', '0A2ou', '1A3quoi', '1A3ou'])
  })
  it('un tir : seulement « que fait-il ? », ni « où » ni « à qui »', () => {
    const s = systeme()
    s.etapes[1].actions = [act('t', 'tir', 'A2', [[3, 4], [2.5, 5], [1.575, 7.5]])]
    expect(questionsPour(s, 2)[2]).toEqual({ type: 'quoi', etape: 1, joueur: 'A2', reponse: 'tir' })
    expect(questionsPour(s, 2)).toHaveLength(3)
  })
})

describe('campActif et postes', () => {
  it('propose les postes de l’attaque, ou de la défense quand ce sont les X qui bougent', () => {
    expect(campActif(systeme())).toBe('attaque')
    expect(postes(systeme())).toEqual([1, 2, 3])
    const defense = systeme()
    defense.etapes[0].actions = [act('g', 'coupe', 'D1', [[8, 7.5], [7, 6], [6, 5]])]
    defense.etapes[1].actions = []
    expect(campActif(defense)).toBe('defense')
    expect(postes(defense)).toEqual([1])
  })
})

describe('verifier', () => {
  it('accepte une arrivée à 1,5 m près et compare les autres réponses', () => {
    const [quoi, ou, qui] = questionsPour(systeme(), 1)
    expect(verifier(ou, [8.9, 5.9])).toBe(true)
    expect(verifier(ou, [8, 7])).toBe(false)
    expect(verifier(quoi, 'dribble')).toBe(true)
    expect(verifier(quoi, 'coupe')).toBe(false)
    expect(verifier(qui, 'A2')).toBe(true)
    expect(verifier(qui, 'A3')).toBe(false)
  })
})

describe('à retravailler', () => {
  it('se fie au dernier score : jamais révisé ou sous 80 %', () => {
    const r = (date: string, bonnes: number) => ({ id: date, document: 's', date, poste: null, bonnes, total: 10 })
    const resultats = [r('2026-10-20', 9), r('2026-10-22', 7), r('2026-10-21', 10)]
    expect(dernierResultat(resultats, 's')?.bonnes).toBe(7)
    expect(aRetravailler(dernierResultat(resultats, 's'))).toBe(true)
    expect(aRetravailler(r('x', 8))).toBe(false)
    expect(aRetravailler(undefined)).toBe(true)
  })
})
