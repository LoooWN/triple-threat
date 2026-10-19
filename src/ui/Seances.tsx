import { useState } from 'react'
import type { Donnees, Ecran } from '../App.tsx'
import { rechercher } from '../modele/documents.ts'
import { nouvelId, type Genre, type Seance, type Systeme } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { aujourdhui, dateLongue, formaterDuree, maintenant, pluriel } from './texte.ts'

// Blocs dont le document existe encore, et leur durée totale.
export const blocsValides = (s: Seance, documents: Systeme[]) =>
  s.blocs.flatMap((bloc) => {
    const doc = documents.find((d) => d.id === bloc.document)
    return doc ? [{ bloc, doc }] : []
  })
const total = (s: Seance, documents: Systeme[]) => blocsValides(s, documents).reduce((t, { bloc }) => t + bloc.duree, 0)

export function ListeSeances({ seances, documents, ouvrir }: { seances: Donnees['seances']; documents: Systeme[]; ouvrir(e: Ecran): void }) {
  const liste = [...(seances.elements ?? [])].sort((a, b) => (b.date || b.creeLe).localeCompare(a.date || a.creeLe))
  return (
    <>
      <div className="outils-liste">
        <p className="intro">Enchaîne exercices et systèmes avec une durée pour chacun, puis présente la séance à l’entraînement.</p>
        <button className="bouton principal" onClick={() => {
          const date = aujourdhui()
          const s: Seance = { id: nouvelId('se'), nom: `Séance du ${dateLongue(date)}`, date, blocs: [], creeLe: maintenant(), modifieLe: maintenant() }
          seances.garder(s)
          ouvrir({ quoi: 'seance', id: s.id })
        }}><Icone.plus />Nouvelle séance</button>
      </div>
      {seances.elements && !liste.length && <p className="vide">Aucune séance pour l’instant.</p>}
      <ul className="liste-seances">
        {liste.map((s) => (
          <li key={s.id}>
            <button className="seance" onClick={() => ouvrir({ quoi: 'seance', id: s.id })} aria-label={`Ouvrir ${s.nom}`}>
              <strong>{s.nom}</strong>
              <span>{[dateLongue(s.date), pluriel(s.blocs.length, 'bloc'), formaterDuree(total(s, documents))].filter(Boolean).join(', ')}</span>
            </button>
            <button className="bouton principal" disabled={!blocsValides(s, documents).length}
              onClick={() => ouvrir({ quoi: 'presentation', id: s.id })}><Icone.lire />Présenter</button>
          </li>
        ))}
      </ul>
    </>
  )
}

interface EditeurProps {
  seance: Seance
  documents: Systeme[]
  onChange(s: Seance): void
  onFermer(): void
  onPresenter(): void
  onSupprimer(): void
}

export function SeanceEditeur({ seance, documents, onChange, onFermer, onPresenter, onSupprimer }: EditeurProps) {
  const [ajout, setAjout] = useState(false)
  const maj = (p: Partial<Seance>) => onChange({ ...seance, ...p, modifieLe: maintenant() })
  const majBloc = (id: string, duree: number) => maj({ blocs: seance.blocs.map((b) => (b.id === id ? { ...b, duree } : b)) })
  const deplacer = (k: number, sens: number) => {
    const blocs = [...seance.blocs]
    ;[blocs[k], blocs[k + sens]] = [blocs[k + sens], blocs[k]]
    maj({ blocs })
  }
  const duree = total(seance, documents)

  return (
    <main className="seance-editeur">
      <header className="barre">
        <button className="bouton" onClick={onFermer}><Icone.retour />Bibliothèque</button>
        <input className="titre-champ" aria-label="Nom de la séance" value={seance.nom} onChange={(e) => maj({ nom: e.target.value })} />
        <input className="date" type="date" aria-label="Date" value={seance.date} onChange={(e) => maj({ date: e.target.value })} />
        <button className="bouton principal" onClick={onPresenter} disabled={!duree}><Icone.lire />Présenter</button>
      </header>

      <div className="contenu-seance">
        <p className="total">{pluriel(seance.blocs.length, 'bloc')}, durée totale <strong>{formaterDuree(duree)}</strong></p>
        <ol className="blocs">
          {seance.blocs.map((b, k) => {
            const d = documents.find((x) => x.id === b.document)
            return (
              <li key={b.id} className="bloc">
                <span className="rang">{k + 1}</span>
                {d ? <TerrainSvg terrain={d.terrain} etape={d.etapes[0]} materiel={d.materiel} aria-hidden="true" /> : <div className="terrain absent" />}
                <div className="infos">
                  <strong>{d?.nom ?? 'Supprimé de la bibliothèque'}</strong>
                  <span>{d ? `${d.genre === 'exercice' ? 'Exercice' : 'Système'}, ${d.categorie}` : 'Ce bloc sera ignoré en présentation.'}</span>
                  <input className="note" placeholder="Note pour ce bloc…" aria-label={`Note du bloc ${k + 1}`} value={b.note}
                    onChange={(e) => maj({ blocs: seance.blocs.map((x) => (x.id === b.id ? { ...x, note: e.target.value } : x)) })} />
                </div>
                <div className="duree-bloc" role="group" aria-label={`Durée du bloc ${k + 1}`}>
                  <button className="bouton rond" onClick={() => majBloc(b.id, Math.max(1, b.duree - 5))} aria-label="5 minutes de moins">−</button>
                  <span>{b.duree} min</span>
                  <button className="bouton rond" onClick={() => majBloc(b.id, Math.min(120, b.duree + 5))} aria-label="5 minutes de plus">+</button>
                </div>
                <div className="ordre">
                  <button className="bouton rond" disabled={k === 0} onClick={() => deplacer(k, -1)} aria-label={`Monter le bloc ${k + 1}`}><Icone.haut /></button>
                  <button className="bouton rond" disabled={k === seance.blocs.length - 1} onClick={() => deplacer(k, 1)} aria-label={`Descendre le bloc ${k + 1}`}><Icone.bas /></button>
                  <button className="bouton rond danger" onClick={() => maj({ blocs: seance.blocs.filter((x) => x.id !== b.id) })}
                    aria-label={`Retirer le bloc ${k + 1}`}><Icone.corbeille /></button>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="actions-seance">
          <button className="bouton principal" onClick={() => setAjout(true)}><Icone.plus />Ajouter un exercice ou un système</button>
          <button className="bouton danger" onClick={() => confirm(`Supprimer la séance « ${seance.nom} » ?`) && onSupprimer()}>
            <Icone.corbeille />Supprimer la séance
          </button>
        </div>
      </div>

      {ajout && (
        <ChoixDocument documents={documents} onFermer={() => setAjout(false)} onChoisir={(d) => {
          maj({ blocs: [...seance.blocs, { id: nouvelId('b'), document: d.id, duree: d.genre === 'exercice' ? d.dureeConseillee : 10, note: '' }] })
          setAjout(false)
        }} />
      )}
    </main>
  )
}

function ChoixDocument({ documents, onChoisir, onFermer }: { documents: Systeme[]; onChoisir(d: Systeme): void; onFermer(): void }) {
  const [genre, setGenre] = useState<Genre>('exercice')
  const [recherche, setRecherche] = useState('')
  const liste = rechercher(documents.filter((d) => d.genre === genre), recherche).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  return (
    <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="fenetre choix-document" role="dialog" aria-label="Ajouter à la séance">
        <h2>Ajouter à la séance</h2>
        <div className="segments" role="group" aria-label="Genre">
          <button aria-pressed={genre === 'exercice'} onClick={() => setGenre('exercice')}>Exercices</button>
          <button aria-pressed={genre === 'systeme'} onClick={() => setGenre('systeme')}>Systèmes</button>
        </div>
        <input type="search" className="recherche" placeholder="Rechercher…" aria-label="Rechercher" value={recherche}
          onChange={(e) => setRecherche(e.target.value)} />
        <ul className="resultats">
          {liste.map((d) => (
            <li key={d.id}>
              <button className="bouton large" onClick={() => onChoisir(d)}><strong>{d.nom}</strong><span>{d.categorie}</span></button>
            </li>
          ))}
        </ul>
        {!liste.length && <p className="vide">Rien à ajouter. Crée d’abord des {genre === 'exercice' ? 'exercices' : 'systèmes'} dans la bibliothèque.</p>}
        <button className="bouton large" onClick={onFermer}>Fermer</button>
      </div>
    </div>
  )
}
