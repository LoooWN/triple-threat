import { describe, expect, it } from 'vitest'
import { assignerMaillot, categoriesDe, maillotsAffiches, normaliser, nouveauDocument, rechercher, variante } from './documents.ts'
import type { Systeme } from './types.ts'

const terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 } as const
// Système tel que la phase 1 l'a enregistré sur l'iPad.
const ancien = {
  id: 's1', nom: 'Corne', terrain, creeLe: 'c', modifieLe: 'm',
  etapes: [
    { id: 'e1', description: 'entrée', joueurs: [], ballon: 'A1', actions: [], textes: [] },
    { id: 'e2', description: '', joueurs: [], ballon: null, actions: [], textes: [] },
  ],
}

describe('normaliser', () => {
  it('convertit un système de la version 1 sans rien perdre', () => {
    const s = normaliser(ancien)
    expect(s).toMatchObject({ id: 's1', nom: 'Corne', genre: 'systeme', categorie: 'Attaque', equipe: null, maillots: {}, materiel: [] })
    expect(s.etapes[0]).toEqual({ id: 'e1', description: 'entrée', joueurs: [], ballons: ['A1'], actions: [], textes: [] })
    expect(s.etapes[1].ballons).toEqual([])
  })
  it('ne change rien à un document déjà en version 2', () => {
    const d = nouveauDocument('exercice', 'Tir', terrain, 'Tir')
    expect(normaliser(d)).toEqual(d)
  })
})

describe('nouveauDocument et variante', () => {
  it('crée un document avec une étape vide, et une variante indépendante dans la même catégorie', () => {
    const d = nouveauDocument('systeme', 'Corne', terrain, 'Attaque')
    expect(d.etapes).toHaveLength(1)
    expect(d.etapes[0].ballons).toEqual([])
    const v = variante(d)
    expect(v.id).not.toBe(d.id)
    expect(v.nom).toBe('Corne – variante')
    expect(v.categorie).toBe('Attaque')
    v.etapes[0].joueurs.push({ id: 'A1', camp: 'attaque', numero: 1, x: 1, y: 1 })
    expect(d.etapes[0].joueurs).toEqual([])
  })
})

describe('rechercher', () => {
  const docs = [
    nouveauDocument('systeme', 'Corne', terrain, 'Attaque'),
    nouveauDocument('systeme', 'Zone 2-3', terrain, 'Défense'),
    { ...nouveauDocument('exercice', 'Tir en course', terrain, 'Tir'), pointsCles: 'Finir main faible' },
  ]
  docs[0].etapes[0].description = 'Écran du 5 pour le meneur'
  it('cherche dans le nom, la catégorie, les étapes et la fiche, sans tenir compte des accents ni des majuscules', () => {
    expect(rechercher(docs, 'defense').map((d) => d.nom)).toEqual(['Zone 2-3'])
    expect(rechercher(docs, 'ECRAN').map((d) => d.nom)).toEqual(['Corne'])
    expect(rechercher(docs, 'faible main').map((d) => d.nom)).toEqual(['Tir en course'])
    expect(rechercher(docs, '  ')).toHaveLength(3)
  })
})

describe('categoriesDe', () => {
  it('donne les catégories par défaut du genre, puis celles créées par le coach', () => {
    const docs = [nouveauDocument('systeme', 'A', terrain, 'Spécial BLOB'), nouveauDocument('exercice', 'B', terrain, 'Contre 1')]
    expect(categoriesDe('systeme', docs)).toEqual(['Attaque', 'Défense', 'Remise en jeu', 'Contre-attaque', 'Fin de match', 'Spécial BLOB'])
    expect(categoriesDe('exercice', docs)).toEqual(['Échauffement', 'Tir', 'Passe', 'Dribble', 'Défense', 'Jeu réduit', 'Contre 1'])
  })
})

describe('maillots', () => {
  const equipe = { id: 'eq1', nom: 'U15 F', modifieLe: 'm', joueurs: [{ id: 'j1', nom: 'Léa', maillot: '00' }, { id: 'j2', nom: 'Inès', maillot: '7' }] }
  it('relie un joueur à un seul pion, et peut le délier', () => {
    let s: Systeme = { ...nouveauDocument('systeme', 'A', terrain, 'Attaque'), equipe: 'eq1' }
    s = assignerMaillot(s, 'A1', 'j1')
    s = assignerMaillot(s, 'A2', 'j1')
    expect(s.maillots).toEqual({ A2: 'j1' })
    s = assignerMaillot(assignerMaillot(s, 'A1', 'j2'), 'A2', null)
    expect(s.maillots).toEqual({ A1: 'j2' })
  })
  it('n’affiche que les maillots d’une équipe et de joueurs qui existent encore', () => {
    const s = { ...nouveauDocument('systeme', 'A', terrain, 'Attaque'), equipe: 'eq1', maillots: { A1: 'j1', A2: 'parti' } }
    expect(maillotsAffiches(s, [equipe])).toEqual({ A1: { maillot: '00', nom: 'Léa' } })
    expect(maillotsAffiches({ ...s, equipe: null }, [equipe])).toEqual({})
  })
})
