import { useCallback, useState } from 'react'

const LIMITE = 100

interface Etat<T> { passe: T[]; present: T; futur: T[]; cle?: string }

// Annuler / rétablir par copies successives. Une `cle` répétée (frappe dans une description) fusionne en un seul pas.
export function useHistorique<T>(initial: T) {
  const [h, setH] = useState<Etat<T>>({ passe: [], present: initial, futur: [] })

  const modifier = useCallback((f: (v: T) => T, cle?: string) => setH((h) => {
    const present = f(h.present)
    if (present === h.present) return h
    if (cle && cle === h.cle) return { ...h, present, futur: [] }
    return { passe: [...h.passe, h.present].slice(-LIMITE), present, futur: [], cle }
  }), [])

  const annuler = useCallback(() => setH((h) => h.passe.length
    ? { passe: h.passe.slice(0, -1), present: h.passe[h.passe.length - 1], futur: [h.present, ...h.futur] }
    : h), [])

  const retablir = useCallback(() => setH((h) => h.futur.length
    ? { passe: [...h.passe, h.present], present: h.futur[0], futur: h.futur.slice(1) }
    : h), [])

  return { valeur: h.present, modifier, annuler, retablir, peutAnnuler: h.passe.length > 0, peutRetablir: h.futur.length > 0 }
}
