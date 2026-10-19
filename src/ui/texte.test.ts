import { expect, it } from 'vitest'
import { dateLongue, formaterDuree, minuteur, pluriel } from './texte.ts'

it('écrit les durées, dates et minuteurs comme un coach les lit', () => {
  expect([formaterDuree(45), formaterDuree(60), formaterDuree(75), formaterDuree(125)]).toEqual(['45 min', '1 h', '1 h 15', '2 h 05'])
  expect(dateLongue('2026-10-21')).toBe('mercredi 21 octobre')
  expect([minuteur(75), minuteur(0), minuteur(-5), minuteur(600)]).toEqual(['01:15', '00:00', '00:00', '10:00'])
  expect([pluriel(1, 'bloc'), pluriel(3, 'bloc')]).toEqual(['1 bloc', '3 blocs'])
})
