import { useCallback, useEffect, useRef, useState } from 'react'
import { demanderPersistance, enregistrer, lister, supprimer, type Collection, type Elements } from './stockage.ts'
import { Bibliotheque, type Onglet } from './ui/Bibliotheque.tsx'
import { Editeur } from './ui/Editeur.tsx'
import { GrandFormat } from './ui/GrandFormat.tsx'
import { MiseAJour } from './ui/MiseAJour.tsx'
import { Presentation } from './ui/Presentation.tsx'
import { Revision } from './ui/Revision.tsx'
import { SeanceEditeur } from './ui/Seances.tsx'

export type Ecran =
  | { quoi: 'bibliotheque' }
  | { quoi: 'editeur' | 'seance' | 'presentation' | 'revision'; id: string }
  | { quoi: 'grand'; id: string; retour: Ecran }

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
    resultats: useCollection('resultats', alerter),
    paquets: useCollection('paquets', alerter),
  }

  useEffect(() => {
    demanderPersistance()
  }, [])

  const [documents, equipes] = [donnees.systemes.elements ?? [], donnees.equipes.elements ?? []]
  // Révisables : la bibliothèque de l'appareil, puis les systèmes reçus par lien.
  const revisables = [...documents, ...(donnees.paquets.elements ?? []).flatMap((p) => p.systemes)]
    .filter((d, k, l) => l.findIndex((x) => x.id === d.id) === k)
  const aReviser = ecran.quoi === 'revision' ? revisables.find((d) => d.id === ecran.id) : undefined
  const enGrand = ecran.quoi === 'grand' ? revisables.find((d) => d.id === ecran.id) : undefined
  const ouvert = ecran.quoi === 'editeur' ? documents.find((s) => s.id === ecran.id) : undefined
  const seance = ecran.quoi === 'seance' || ecran.quoi === 'presentation' ? donnees.seances.elements?.find((s) => s.id === ecran.id) : undefined
  const retour = () => setEcran({ quoi: 'bibliotheque' })
  return (
    <>
      {ouvert ? (
        <Editeur key={ouvert.id} initial={ouvert} equipes={equipes} onChange={donnees.systemes.garder} onFermer={retour}
          onPresenter={() => setEcran({ quoi: 'grand', id: ouvert.id, retour: ecran })} />
      ) : enGrand && ecran.quoi === 'grand' ? (
        <GrandFormat doc={enGrand} equipes={equipes} onFermer={() => setEcran(ecran.retour)} />
      ) : aReviser ? (
        <Revision key={aReviser.id} doc={aReviser} onFermer={retour} onResultat={donnees.resultats.garder} />
      ) : seance && ecran.quoi === 'seance' ? (
        <SeanceEditeur seance={seance} documents={documents} onChange={donnees.seances.garder} onFermer={retour}
          onPresenter={() => setEcran({ quoi: 'presentation', id: seance.id })}
          onSupprimer={() => { donnees.seances.retirer(seance.id); retour() }} />
      ) : seance && ecran.quoi === 'presentation' ? (
        <Presentation seance={seance} documents={documents} equipes={equipes} onFermer={() => setEcran({ quoi: 'seance', id: seance.id })} />
      ) : (
        <Bibliotheque donnees={donnees} revisables={revisables} onglet={onglet} setOnglet={setOnglet} ouvrir={setEcran} />
      )}
      <MiseAJour />
      <div className="tourner" aria-hidden="true">Tourne l’iPad en paysage</div>
    </>
  )
}
