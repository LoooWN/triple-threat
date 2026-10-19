import { useCallback, useEffect, useRef, useState } from 'react'
import { nouvelId, type Systeme, type Terrain } from './modele/types.ts'
import { demanderPersistance, enregistrerSysteme, listerSystemes, retenirTerrain, supprimerSysteme } from './stockage.ts'
import { Editeur } from './ui/Editeur.tsx'
import { Liste } from './ui/Liste.tsx'
import { MiseAJour } from './ui/MiseAJour.tsx'

export default function App() {
  const [systemes, setSystemes] = useState<Systeme[] | null>(null)
  const [ouvert, setOuvert] = useState<string | null>(null)
  const alerte = useRef(false)

  useEffect(() => {
    demanderPersistance()
    listerSystemes().then(setSystemes, () => setSystemes([]))
  }, [])

  const enregistrer = useCallback((s: Systeme) => {
    setSystemes((l) => [...(l ?? []).filter((x) => x.id !== s.id), s])
    enregistrerSysteme(s).catch(() => {
      // Une seule alerte : on ne bloque pas le coach à chaque trait.
      if (alerte.current) return
      alerte.current = true
      alert('Impossible d’enregistrer sur cet iPad (stockage plein ou navigation privée). Exporte ton système pour ne pas le perdre.')
    })
  }, [])

  const creer = (nom: string, terrain: Terrain) => {
    retenirTerrain(terrain)
    const maintenant = new Date().toISOString()
    const s: Systeme = {
      id: nouvelId('s'), nom, terrain, creeLe: maintenant, modifieLe: maintenant,
      etapes: [{ id: nouvelId('e'), description: '', joueurs: [], ballon: null, actions: [], textes: [] }],
    }
    enregistrer(s)
    setOuvert(s.id)
  }

  const systeme = systemes?.find((s) => s.id === ouvert)
  return (
    <>
      {systeme ? (
        <Editeur key={systeme.id} initial={systeme} onChange={enregistrer} onFermer={() => setOuvert(null)} />
      ) : (
        <Liste systemes={systemes} onOuvrir={setOuvert} onCreer={creer} onEnregistrer={enregistrer}
          onSupprimer={(id) => { setSystemes((l) => l && l.filter((x) => x.id !== id)); supprimerSysteme(id) }} />
      )}
      <MiseAJour />
      <div className="tourner" aria-hidden="true">Tourne l’iPad en paysage</div>
    </>
  )
}
