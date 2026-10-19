import { useEffect, useState } from 'react'
import { maillotsAffiches } from '../modele/documents.ts'
import type { Bloc, Equipe, Seance, Systeme } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { blocsValides } from './Seances.tsx'
import { TableauBlanc } from './TableauBlanc.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { minuteur } from './texte.ts'
import { CommandesLecture, useLecture } from './useLecture.tsx'

// Garde l'écran de l'iPad allumé pendant l'entraînement (si Safari le permet).
function useEcranAllume() {
  useEffect(() => {
    let verrou: WakeLockSentinel | null = null
    const demander = () => {
      if (document.visibilityState === 'visible') navigator.wakeLock?.request('screen').then((v) => { verrou = v }, () => {})
    }
    demander()
    document.addEventListener('visibilitychange', demander)
    return () => {
      document.removeEventListener('visibilitychange', demander)
      verrou?.release().catch(() => {})
    }
  }, [])
}

interface Props { seance: Seance; documents: Systeme[]; equipes: Equipe[]; onFermer(): void }

export function Presentation({ seance, documents, equipes, onFermer }: Props) {
  const blocs = blocsValides(seance, documents)
  const [k, setK] = useState(0)
  useEcranAllume()
  if (!blocs.length) return null
  const rang = Math.min(k, blocs.length - 1)
  const { bloc, doc } = blocs[rang]
  return (
    <BlocPresente key={bloc.id} bloc={bloc} doc={doc} equipes={equipes} rang={rang} total={blocs.length}
      precedent={() => setK(rang - 1)} suivant={() => setK(rang + 1)} onFermer={onFermer} />
  )
}

interface BlocProps {
  bloc: Bloc
  doc: Systeme
  equipes: Equipe[]
  rang: number
  total: number
  precedent(): void
  suivant(): void
  onFermer(): void
}

function BlocPresente({ bloc, doc, equipes, rang, total, precedent, suivant, onFermer }: BlocProps) {
  const l = useLecture(doc.etapes)
  const [restant, setRestant] = useState(bloc.duree * 60)
  const [enMarche, setEnMarche] = useState(false)
  const [tableau, setTableau] = useState(false)
  useEffect(() => {
    if (!enMarche) return
    const t = setInterval(() => setRestant((r) => r - 1), 1000)
    return () => clearInterval(t)
  }, [enMarche])
  const etape = doc.etapes[l.i]
  const fini = restant <= 0
  const fiche = ([['Mise en place', doc.miseEnPlace], ['Points clés', doc.pointsCles], ['Variantes', doc.variantes]] as const).filter(([, t]) => t.trim())

  return (
    <main className={`presentation${doc.terrain.vue === 'entier' ? ' entier' : ''}`}>
      <header className="barre">
        <button className="bouton" onClick={onFermer}><Icone.retour />Quitter</button>
        <div className="titre-presentation">
          <span>{rang + 1} / {total}</span>
          <strong>{doc.nom}</strong>
        </div>
        <button className="bouton" aria-pressed={tableau} onClick={() => setTableau(!tableau)}><Icone.tableau />Tableau blanc</button>
        <div className={`chrono${fini ? ' fini' : ''}`} role="timer" aria-label="Temps restant">{fini ? 'Temps écoulé' : minuteur(restant)}</div>
        <button className="bouton principal" onClick={() => setEnMarche(!enMarche)}>
          {enMarche ? 'Pause' : restant === bloc.duree * 60 ? 'Démarrer' : 'Reprendre'}
        </button>
        <button className="bouton rond" aria-label="Remettre le minuteur au début" onClick={() => { setEnMarche(false); setRestant(bloc.duree * 60) }}>
          <Icone.tourner />
        </button>
      </header>

      <div className="zone-terrain">
        <TerrainSvg terrain={doc.terrain} etape={etape} anime={l.anime} maillots={maillotsAffiches(doc, equipes)} materiel={doc.materiel} />
        {tableau && <TableauBlanc terrain={doc.terrain} onFermer={() => setTableau(false)} />}
      </div>

      <aside className="panneau">
        {doc.etapes.length > 1 && (
          <div className="etapes" role="tablist" aria-label="Étapes">
            {doc.etapes.map((e, n) => (
              <button key={e.id} role="tab" aria-selected={n === l.i} className="pastille" onClick={() => l.aller(n)}>{n + 1}</button>
            ))}
          </div>
        )}
        <CommandesLecture l={l} precedent={() => l.aller(l.i - 1)} />
        {etape.description && <p className="texte-etape">{etape.description}</p>}
        {fiche.map(([titre, texte]) => (
          <section key={titre} className="fiche">
            <h3>{titre}</h3>
            <p>{texte}</p>
          </section>
        ))}
        {bloc.note && <p className="note-bloc">{bloc.note}</p>}
      </aside>

      <div className="tourner" aria-hidden="true">Tourne l’iPad en paysage</div>
      <footer className="navigation">
        <button className="bouton" disabled={rang === 0} onClick={precedent}><Icone.precedent />Précédent</button>
        <button className="bouton principal" disabled={rang === total - 1} onClick={suivant}>Suivant<Icone.suivant /></button>
      </footer>
    </main>
  )
}
