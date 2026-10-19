import { describe, expect, it } from 'vitest'
import { nouveauDocument } from './documents.ts'
import { decoderPaquet, encoderPaquet, paquetPour } from './lien.ts'
import type { Action, Joueur, Point, Systeme } from './types.ts'

const terrain = { vue: 'demi', longueur: 28, largeur: 15, ligne3pts: 6.75 } as const
// Un système réaliste : 5 contre 5, 3 étapes de 4 actions.
function systeme(nom: string): Systeme {
  const joueurs: Joueur[] = [1, 2, 3, 4, 5].flatMap((n) => [
    { id: `A${n}`, camp: 'attaque' as const, numero: n, x: 3 + n * 1.3, y: 1 + n * 2.6 },
    { id: `D${n}`, camp: 'defense' as const, numero: n, x: 2.5 + n * 1.3, y: 1.2 + n * 2.6 },
  ])
  const actions: Action[] = [1, 2, 3, 4].map((n): Action => ({
    id: `a${n}`, type: n === 4 ? 'passe' : 'coupe', joueur: `A${n}`, couleur: '#1b2430',
    chemin: [[3 + n * 1.3, 1 + n * 2.6], [4.12, 5.37], [2.51, 6.83]] as Point[], ...(n === 4 ? { vers: 'A1' } : {}),
  }))
  const etapes = [0, 1, 2].map((k) => ({ id: `e${k}`, description: 'Le 2 sort de l’écran, le 1 lui passe.', joueurs, ballons: ['A1'], actions, textes: [] }))
  return { ...nouveauDocument('systeme', nom, terrain, 'Attaque'), etapes, equipe: 'eq1', maillots: { A1: 'j1' } }
}

describe('lien de révision', () => {
  it('fait l’aller-retour, sans équipe ni maillots, et reste court', async () => {
    const paquet = paquetPour('Systèmes U15 F', [systeme('Corne'), systeme('Zone')])
    const code = await encoderPaquet(paquet)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(code.length).toBeLessThan(4000)
    const recu = await decoderPaquet(code)
    expect(recu).toEqual(paquet)
    expect(recu.systemes[0].equipe).toBeNull()
    expect(recu.systemes[0].maillots).toEqual({})
  })
  it('refuse un lien tronqué, abîmé ou étranger avec un message clair', async () => {
    const code = await encoderPaquet(paquetPour('Test', [systeme('Corne')]))
    await expect(decoderPaquet(code.slice(0, code.length / 2))).rejects.toThrow(/incomplet ou abîmé/)
    await expect(decoderPaquet('nimportequoi!')).rejects.toThrow(/incomplet ou abîmé/)
    const etranger = await encoderPaquet({ ...paquetPour('X', []), systemes: [{ nom: 'pas un système' } as never] })
    await expect(decoderPaquet(etranger)).rejects.toThrow(/abîmé/)
  })
})
