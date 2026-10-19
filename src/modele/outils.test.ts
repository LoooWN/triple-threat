import { describe, expect, it } from 'vitest'
import { placerDefense } from './defense.ts'
import { attacherTrait, receveurPasse } from './etapes.ts'
import { exporter, importer } from './fichier.ts'
import { distance } from './geometrie.ts'
import { lisserTrace } from './lissage.ts'
import { miroirEtape, miroirSysteme } from './miroir.ts'
import type { Etape, Point, Systeme } from './types.ts'

const terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 } as const
const etape = (): Etape => ({
  id: 'e1',
  description: 'entrée',
  joueurs: [
    { id: 'A1', camp: 'attaque', numero: 1, x: 7.575, y: 7.5 },
    { id: 'A2', camp: 'attaque', numero: 2, x: 4, y: 2 },
    { id: 'D2', camp: 'defense', numero: 2, x: 3.5, y: 2.5 },
  ],
  ballon: 'A1',
  actions: [{ id: 'a1', type: 'coupe', joueur: 'A2', chemin: [[4, 2], [3, 4], [2, 6]], couleur: '#222' }],
  textes: [{ id: 't1', x: 3, y: 13.5, texte: 'Lire' }],
})
const systeme = (): Systeme => ({
  id: 's1', nom: 'Corne', terrain: { ...terrain }, creeLe: '2026-10-19T10:00:00Z', modifieLe: '2026-10-19T11:00:00Z', etapes: [etape()],
})
const ligne = (de: Point, a: Point, n = 30): Point[] =>
  Array.from({ length: n + 1 }, (_, i) => [de[0] + ((a[0] - de[0]) * i) / n, de[1] + ((a[1] - de[1]) * i) / n])

describe('miroir', () => {
  it('retourne gauche-droite (y → largeur − y) joueurs, actions et textes', () => {
    const m = miroirEtape(etape(), 15)
    expect(m.joueurs[1]).toMatchObject({ x: 4, y: 13 })
    expect(m.actions[0].chemin).toEqual([[4, 13], [3, 11], [2, 9]])
    expect(m.textes[0]).toMatchObject({ x: 3, y: 1.5, texte: 'Lire' })
  })
  it('deux miroirs redonnent le système de départ, et la largeur du terrain est respectée', () => {
    const s = systeme()
    expect(miroirSysteme(miroirSysteme(s))).toEqual(s)
    const etroit = { ...s, terrain: { ...s.terrain, largeur: 14 } }
    expect(miroirSysteme(etroit).etapes[0].joueurs[0].y).toBe(6.5)
  })
})

describe('placerDefense', () => {
  it('place un défenseur à 1 m de chaque attaquant vers le panier, sans doubler un défenseur existant', () => {
    const e = placerDefense(etape(), terrain)
    const d1 = e.joueurs.find((j) => j.camp === 'defense' && j.numero === 1)!
    expect(d1.x).toBeCloseTo(6.575)
    expect(d1.y).toBeCloseTo(7.5)
    expect(e.joueurs.filter((j) => j.camp === 'defense' && j.numero === 2)).toHaveLength(1)
    expect(new Set(e.joueurs.map((j) => j.id)).size).toBe(e.joueurs.length)
  })
})

describe('lisserTrace', () => {
  it('ignore un trait trop court', () => {
    expect(lisserTrace(ligne([1, 1], [1.2, 1.1]))).toBeNull()
  })
  it('transforme un trait droit tremblé en une courbe avec une poignée sur la ligne', () => {
    const brut = ligne([0, 0], [5, 0]).map(([x, y], i) => [x, y + (i % 2 ? 0.04 : -0.04)] as Point)
    const c = lisserTrace(brut)!
    expect(c).toHaveLength(3)
    expect(distance(c[0], [0, -0.04])).toBeLessThan(0.01)
    expect(distance(c[2], [5, -0.04])).toBeLessThan(0.01)
    expect(Math.abs(c[1][1])).toBeLessThan(0.1)
  })
  it('garde la courbure d’un arc, du bon côté', () => {
    const arc = Array.from({ length: 41 }, (_, i): Point => {
      const a = Math.PI * (0.25 + (0.5 * i) / 40)
      return [3 + 4.24 * Math.cos(a), -3 + 4.24 * Math.sin(a)]
    })
    const c = lisserTrace(arc)!
    expect(c).toHaveLength(3)
    expect(c[1][1]).toBeGreaterThan(1.5)
  })
  it('garde un coin net (coupe en V ou en L) en deux morceaux', () => {
    const v = lisserTrace([...ligne([0, 0], [3, 3]), ...ligne([3, 3], [6, 0]).slice(1)])!
    expect(v).toHaveLength(5)
    expect(distance(v[2], [3, 3])).toBeLessThan(0.2)
    const l = lisserTrace([...ligne([0, 0], [0, 4]), ...ligne([0, 4], [4, 4]).slice(1)])!
    expect(l).toHaveLength(5)
    expect(distance(l[2], [0, 4])).toBeLessThan(0.2)
  })
})

describe('attacherTrait', () => {
  it('accroche le trait au joueur le plus proche de son départ (ou au bout de sa dernière action)', () => {
    const e = etape()
    expect(attacherTrait(e, [[7.8, 7.3], [6, 6], [5, 5]])).toEqual({ joueur: 'A1', chemin: [[7.575, 7.5], [5.8875, 6.1], [5, 5]] })
    expect(attacherTrait(e, [[2.1, 6.1], [2, 8], [2, 10]])?.joueur).toBe('A2')
    expect(attacherTrait(e, [[12, 12], [11, 11], [10, 10]])).toBeNull()
  })
  it('donne le trait au joueur sur lequel il commence, même si l’action d’un autre finit plus près', () => {
    const e = etape()
    e.joueurs.push({ id: 'A4', camp: 'attaque', numero: 4, x: 2.3, y: 6.3 })
    expect(attacherTrait(e, [[2.1, 6.1], [3, 7], [4, 8]])?.joueur).toBe('A4')
  })
})

describe('receveurPasse', () => {
  it('accroche la passe au joueur le plus proche de son arrivée, là où il sera en fin d’étape', () => {
    const r = receveurPasse(etape(), 'A1', [[7.575, 7.5], [5, 6], [2.3, 5.8]])!
    expect(r.vers).toBe('A2')
    expect(r.chemin.at(-1)).toEqual([2, 6])
    expect(receveurPasse(etape(), 'A1', [[7.575, 7.5], [9, 11], [10, 13]])).toBeNull()
  })
})

describe('export / import', () => {
  it('fait l’aller-retour sans rien perdre', () => {
    const texte = exporter([systeme()])
    expect(JSON.parse(texte)).toMatchObject({ format: 'triple-threat', version: 1 })
    expect(importer(texte, [])).toEqual({ nouveaux: [systeme()], dejaPresents: 0 })
  })
  it('n’écrase jamais : un système modifié entre-temps arrive en copie, un identique est ignoré', () => {
    const texte = exporter([systeme()])
    const autre = { ...systeme(), modifieLe: '2026-10-20T09:00:00Z' }
    const r = importer(texte, [autre])
    expect(r.nouveaux[0].id).not.toBe('s1')
    expect(r.nouveaux[0].nom).toBe('Corne (copie)')
    expect(importer(texte, [systeme()])).toEqual({ nouveaux: [], dejaPresents: 1 })
  })
  it('refuse un fichier illisible, étranger, plus récent ou abîmé avec un message clair', () => {
    expect(() => importer('pas du json', [])).toThrow(/lisible/)
    expect(() => importer('{"format":"autre"}', [])).toThrow(/ne vient pas/)
    expect(() => importer('{"format":"triple-threat","version":2,"systemes":[]}', [])).toThrow(/plus récente/)
    const sansEtapes = { ...systeme(), etapes: undefined }
    expect(() => importer(JSON.stringify({ format: 'triple-threat', version: 1, systemes: [sansEtapes] }), [])).toThrow(/abîmé/)
    const mauvaisChemin = systeme()
    mauvaisChemin.etapes[0].actions[0].chemin = [[1, 2]]
    expect(() => importer(exporter([mauvaisChemin]), [])).toThrow(/abîmé/)
  })
})
