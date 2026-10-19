import { useState } from 'react'
import { partagerFichier } from '../stockage.ts'
import { Icone } from './Icones.tsx'

// Safari n'ouvre la feuille de partage que juste après un toucher : on prépare d'abord le fichier,
// puis un bouton « Partager » l'envoie aussitôt.
export function useExport() {
  const [prepa, setPrepa] = useState(false)
  const [pret, setPret] = useState<{ nom: string; blob: Blob } | null>(null)

  const lancer = async (nom: string, fabriquer: () => Promise<Blob>) => {
    setPrepa(true)
    try {
      setPret({ nom, blob: await fabriquer() })
    } catch (e) {
      alert(`Export impossible : ${(e as Error).message}`)
    } finally {
      setPrepa(false)
    }
  }

  const fenetre = (prepa || pret) && (
    <div className="voile">
      <div className="fenetre petite" role="dialog" aria-label="Export">
        {pret ? (
          <>
            <h2>{pret.nom.endsWith('.pdf') ? 'PDF prêt' : 'Image prête'}</h2>
            <button className="bouton large principal" onClick={() => { partagerFichier(pret.nom, pret.blob, pret.blob.type); setPret(null) }}>
              <Icone.partager />Partager ou enregistrer
            </button>
            <button className="bouton large" onClick={() => setPret(null)}>Fermer</button>
          </>
        ) : <p className="titre-menu" role="status">Préparation…</p>}
      </div>
    </div>
  )
  return { lancer, fenetre }
}
