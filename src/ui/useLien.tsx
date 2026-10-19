import { useState } from 'react'
import { encoderPaquet, paquetPour, PREFIXE } from '../modele/lien.ts'
import type { Systeme } from '../modele/types.ts'
import { Icone } from './Icones.tsx'

const LONG = 30000 // au-delà, certaines messageries coupent le lien

// Comme pour l'export : on prépare d'abord, puis « Envoyer » ouvre la feuille de partage juste après le toucher.
export function useLien(montrer: (t: string) => void) {
  const [prepa, setPrepa] = useState(false)
  const [lien, setLien] = useState<{ titre: string; url: string } | null>(null)

  const preparer = async (titre: string, docs: Systeme[]) => {
    setPrepa(true)
    try {
      const code = await encoderPaquet(paquetPour(titre, docs))
      setLien({ titre, url: `${location.origin}${import.meta.env.BASE_URL}${PREFIXE}${code}` })
    } catch (e) {
      alert(`Lien impossible à créer : ${(e as Error).message}`)
    } finally {
      setPrepa(false)
    }
  }

  const copier = (url: string) =>
    navigator.clipboard?.writeText(url).then(() => montrer('Lien copié.'), () => montrer('Copie impossible : sélectionne le lien et copie-le.'))

  const fenetre = (prepa || lien) && (
    <div className="voile">
      <div className="fenetre petite" role="dialog" aria-label="Lien de révision">
        {lien ? (
          <>
            <h2>Lien de révision prêt</h2>
            <p className="titre-menu">
              « {lien.titre} » : les joueurs l’ouvrent sur leur téléphone, sans rien installer.
              Les prénoms et les maillots ne sont pas dans le lien.
            </p>
            {lien.url.length > LONG && <p className="alerte">Lien très long : certaines messageries le coupent. Envoie moins de systèmes à la fois.</p>}
            <input className="lien" readOnly value={lien.url} aria-label="Lien" onFocus={(e) => e.target.select()} />
            <button className="bouton large principal" onClick={() => {
              if (navigator.share) navigator.share({ title: `Révision : ${lien.titre}`, text: `Révise « ${lien.titre} » :`, url: lien.url }).catch(() => {})
              else copier(lien.url)
            }}><Icone.partager />Envoyer aux joueurs</button>
            <button className="bouton large" onClick={() => copier(lien.url)}>Copier le lien</button>
            <button className="bouton large" onClick={() => setLien(null)}>Fermer</button>
          </>
        ) : <p className="titre-menu" role="status">Préparation…</p>}
      </div>
    </div>
  )
  return { preparer, fenetre }
}
