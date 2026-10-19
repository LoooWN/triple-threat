import { maillotsAffiches } from '../modele/documents.ts'
import type { Equipe, Systeme } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { useLecture } from './useLecture.tsx'

// Lisible de loin : terrain plein écran, description en très gros, toucher à droite = étape suivante animée.
export function GrandFormat({ doc, equipes, onFermer }: { doc: Systeme; equipes: Equipe[]; onFermer(): void }) {
  const l = useLecture(doc.etapes)
  const etape = doc.etapes[l.i]
  const suivant = () => {
    if (l.lecture) return
    if (etape.actions.length) l.jouerEtape()
    else if (l.i < doc.etapes.length - 1) l.aller(l.i + 1)
  }
  return (
    <main className="grand">
      <header className="barre-grand">
        <button className="bouton" onClick={onFermer}><Icone.retour />Fermer</button>
        <strong>{doc.nom}</strong>
        <span className="etape-grand" aria-live="polite">Étape {l.i + 1} / {doc.etapes.length}</span>
        <button className="bouton principal" onClick={l.lire}>{l.lecture ? <><Icone.stop />Arrêter</> : <><Icone.lire />Tout lire</>}</button>
      </header>
      <div className="scene">
        <TerrainSvg terrain={doc.terrain} etape={etape} anime={l.anime} maillots={maillotsAffiches(doc, equipes)} materiel={doc.materiel} />
        <button className="zone-tap gauche" aria-label="Étape précédente" onClick={() => l.aller(Math.max(0, l.i - 1))} />
        <button className="zone-tap droite" aria-label="Étape suivante" onClick={suivant} />
      </div>
      {etape.description && <p className="description-grand">{etape.description}</p>}
    </main>
  )
}
