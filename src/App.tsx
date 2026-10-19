import { useCallback, useEffect, useRef, useState } from 'react'
import { demanderPersistance, enregistrer, lister, supprimer, type Collection, type Elements } from './stockage.ts'
import { Bibliotheque, type Onglet } from './ui/Bibliotheque.tsx'
import { Editeur } from './ui/Editeur.tsx'
import { MiseAJour } from './ui/MiseAJour.tsx'

export type Ecran = { quoi: 'bibliotheque' } | { quoi: 'editeur'; id: string }

// Une collection gardée en mémoire et enregistrée sur l'iPad à chaque changement.
function useCollection<C extends Collection>(c: C, alerter: () => void) {
  const [elements, setElements] = useState<Elements[C][] | null>(null)
  useEffect(() => {
    lister(c).then(setElements, () => setElements([]))
  }, [c])
  const garder = useCallback((x: Elements[C]) => {
    setElements((l) => [...(l ?? []).filter((y) => y.id !== x.id), x])
    enregistrer(c, x).catch(alerter)
  }, [c, alerter])
  const retirer = useCallback((id: string) => {
    setElements((l) => l && l.filter((y) => y.id !== id))
    supprimer(c, id).catch(alerter)
  }, [c, alerter])
  return { elements, garder, retirer }
}
export type Donnees = { [C in Collection]: ReturnType<typeof useCollection<C>> }

export default function App() {
  const [ecran, setEcran] = useState<Ecran>({ quoi: 'bibliotheque' })
  const [onglet, setOnglet] = useState<Onglet>('systeme')
  const alerte = useRef(false)
  const alerter = useCallback(() => {
    // Une seule alerte : on ne bloque pas le coach à chaque trait.
    if (alerte.current) return
    alerte.current = true
    alert('Impossible d’enregistrer sur cet iPad (stockage plein ou navigation privée). Exporte tes données pour ne pas les perdre.')
  }, [])
  const donnees: Donnees = {
    systemes: useCollection('systemes', alerter),
    seances: useCollection('seances', alerter),
    equipes: useCollection('equipes', alerter),
  }

  useEffect(() => {
    demanderPersistance()
  }, [])

  const document = ecran.quoi === 'editeur' ? donnees.systemes.elements?.find((s) => s.id === ecran.id) : undefined
  return (
    <>
      {document ? (
        <Editeur key={document.id} initial={document} equipes={donnees.equipes.elements ?? []}
          onChange={donnees.systemes.garder} onFermer={() => setEcran({ quoi: 'bibliotheque' })} />
      ) : (
        <Bibliotheque donnees={donnees} onglet={onglet} setOnglet={setOnglet} ouvrir={setEcran} />
      )}
      <MiseAJour />
      <div className="tourner" aria-hidden="true">Tourne l’iPad en paysage</div>
    </>
  )
}
