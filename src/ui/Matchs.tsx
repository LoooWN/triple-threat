import { useState } from 'react'
import type { Donnees, Ecran } from '../App.tsx'
import { feuille, nomQuart, scoreAdverse, scoreNous, scoreParQuart } from '../modele/stats.ts'
import { nouvelId, type Equipe, type Match, type Stat } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { aujourdhui, dateLongue, maintenant } from './texte.ts'

// Boutons de statistiques, par paires : réussi / raté, offensif / défensif…
const STATS: [Stat, string][] = [
  ['tir2', '2 pts'], ['tir2rate', '2 pts raté'],
  ['tir3', '3 pts'], ['tir3rate', '3 pts raté'],
  ['lf', 'Lancer franc'], ['lfrate', 'LF raté'],
  ['rebOff', 'Rebond off.'], ['rebDef', 'Rebond déf.'],
  ['passe', 'Passe déc.'], ['interception', 'Interception'],
  ['contre', 'Contre'], ['perte', 'Perte de balle'],
  ['faute', 'Faute'],
]
const NOMS = Object.fromEntries(STATS) as Record<Stat, string>

export function ListeMatchs({ matchs, equipes, ouvrir }: { matchs: Donnees['matchs']; equipes: Equipe[]; ouvrir(e: Ecran): void }) {
  const [creation, setCreation] = useState(false)
  const liste = [...(matchs.elements ?? [])].sort((a, b) => b.date.localeCompare(a.date) || b.creeLe.localeCompare(a.creeLe))
  return (
    <>
      <div className="outils-liste">
        <p className="intro">Note les statistiques en direct : touche un joueur, puis l’action. Tout reste sur cet iPad.</p>
        <button className="bouton principal" onClick={() => setCreation(true)}><Icone.plus />Nouveau match</button>
      </div>
      {matchs.elements && !liste.length && <p className="vide">Aucun match pour l’instant.</p>}
      <ul className="liste-seances">
        {liste.map((m) => (
          <li key={m.id}>
            <button className="seance" onClick={() => ouvrir({ quoi: 'match', id: m.id })} aria-label={`Ouvrir le match contre ${m.adversaire}`}>
              <strong>{equipes.find((e) => e.id === m.equipe)?.nom ?? 'Nous'} {scoreNous(m)} – {scoreAdverse(m)} {m.adversaire}</strong>
              <span>{dateLongue(m.date)}</span>
            </button>
          </li>
        ))}
      </ul>
      {creation && (
        <NouveauMatch equipes={equipes} onAnnuler={() => setCreation(false)} onCreer={(m) => {
          matchs.garder(m)
          setCreation(false)
          ouvrir({ quoi: 'match', id: m.id })
        }} />
      )}
    </>
  )
}

function NouveauMatch({ equipes, onCreer, onAnnuler }: { equipes: Equipe[]; onCreer(m: Match): void; onAnnuler(): void }) {
  const [equipe, setEquipe] = useState(equipes[0]?.id ?? '')
  const [adversaire, setAdversaire] = useState('')
  const [date, setDate] = useState(aujourdhui())
  const joueurs = equipes.find((e) => e.id === equipe)?.joueurs ?? []
  const [absents, setAbsents] = useState<string[]>([])
  return (
    <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && onAnnuler()}>
      <form className="fenetre nouveau-match" onSubmit={(e) => {
        e.preventDefault()
        onCreer({
          id: nouvelId('m'), equipe: equipe || null, adversaire: adversaire.trim() || 'Adversaire', date,
          presents: joueurs.filter((j) => !absents.includes(j.id)).map((j) => j.id),
          evenements: [], adverses: [], quart: 1, creeLe: maintenant(), modifieLe: maintenant(),
        })
      }}>
        <h2>Nouveau match</h2>
        {!equipes.length && <p className="alerte">Crée d’abord ton équipe dans l’onglet Effectif : les statistiques se notent par joueur.</p>}
        {equipes.length > 1 && (
          <fieldset className="choix">
            <legend>Équipe</legend>
            <div className="segments">
              {equipes.map((e) => <button type="button" key={e.id} aria-pressed={equipe === e.id} onClick={() => { setEquipe(e.id); setAbsents([]) }}>{e.nom}</button>)}
            </div>
          </fieldset>
        )}
        <label className="champ">Adversaire<input value={adversaire} onChange={(e) => setAdversaire(e.target.value)} placeholder="Ex. : BC Villeurbanne" autoFocus /></label>
        <label className="champ">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        {joueurs.length > 0 && (
          <fieldset className="choix">
            <legend>Présents (touche pour retirer un absent)</legend>
            <div className="segments">
              {joueurs.map((j) => (
                <button type="button" key={j.id} aria-pressed={!absents.includes(j.id)}
                  onClick={() => setAbsents((a) => (a.includes(j.id) ? a.filter((x) => x !== j.id) : [...a, j.id]))}>
                  {j.maillot || '–'} {j.nom}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="boutons">
          <button type="button" className="bouton" onClick={onAnnuler}>Annuler</button>
          <button className="bouton principal" disabled={!equipes.length}>Commencer</button>
        </div>
      </form>
    </div>
  )
}

interface DirectProps { match: Match; equipe?: Equipe; onChange(m: Match): void; onFermer(): void; onSupprimer(): void }

export function MatchDirect({ match: m, equipe, onChange, onFermer, onSupprimer }: DirectProps) {
  const [choisi, setChoisi] = useState<string | null>(null)
  const [vue, setVue] = useState<'direct' | 'feuille'>('direct')
  const [dernier, setDernier] = useState<string | null>(null)
  const maj = (p: Partial<Match>) => onChange({ ...m, ...p, modifieLe: maintenant() })
  const joueurs = (equipe?.joueurs ?? []).filter((j) => m.presents.includes(j.id))
    .sort((a, b) => (Number(a.maillot) || 0) - (Number(b.maillot) || 0))
  const nom = (id: string) => {
    const j = equipe?.joueurs.find((x) => x.id === id)
    return j ? `${j.maillot} ${j.nom}`.trim() : 'Joueur retiré'
  }
  const noter = (stat: Stat) => {
    if (!choisi) return
    maj({ evenements: [...m.evenements, { id: nouvelId('ev'), joueur: choisi, stat, quart: m.quart }] })
    setDernier(`${nom(choisi)} : ${NOMS[stat]}`)
  }
  const annulerDernier = () => {
    const e = m.evenements[m.evenements.length - 1]
    if (!e) return
    maj({ evenements: m.evenements.slice(0, -1) })
    setDernier(`Annulé : ${nom(e.joueur)}, ${NOMS[e.stat]}`)
  }

  return (
    <main className="match">
      <header className="barre">
        <button className="bouton" onClick={onFermer}><Icone.retour />Bibliothèque</button>
        <div className="score-match" aria-live="polite">
          <span>{equipe?.nom ?? 'Nous'}</span>
          <strong>{scoreNous(m)} – {scoreAdverse(m)}</strong>
          <span>{m.adversaire}</span>
        </div>
        <div className="segments quarts" role="group" aria-label="Quart-temps">
          {Array.from({ length: Math.max(4, m.quart) }, (_, k) => k + 1).map((q) => (
            <button key={q} aria-pressed={m.quart === q} onClick={() => maj({ quart: q })}>{nomQuart(q)}</button>
          ))}
          <button aria-label="Ajouter une prolongation" onClick={() => maj({ quart: Math.max(4, m.quart) + 1 })}>+</button>
        </div>
        <div className="segments" role="group" aria-label="Affichage">
          <button aria-pressed={vue === 'direct'} onClick={() => setVue('direct')}>En direct</button>
          <button aria-pressed={vue === 'feuille'} onClick={() => setVue('feuille')}>Feuille</button>
        </div>
      </header>

      {vue === 'direct' ? (
        <div className="direct">
          <section className="joueurs-match" aria-label="Joueurs">
            {joueurs.map((j) => {
              const f = feuille(m, j.id)
              return (
                <button key={j.id} className={`tuile${choisi === j.id ? ' choisie' : ''}${f.fautes >= 5 ? ' exclu' : f.fautes === 4 ? ' alerte-fautes' : ''}`}
                  aria-pressed={choisi === j.id} onClick={() => setChoisi(j.id)}>
                  <strong>{j.maillot || '–'}</strong>
                  <span className="nom">{j.nom}</span>
                  <span className="ligne-stats">{f.pts} pts, {f.fautes >= 5 ? '5 fautes' : `${f.fautes} f.`}</span>
                </button>
              )
            })}
            {!joueurs.length && <p className="vide">Aucun joueur présent. Ajoute des joueurs à l’équipe dans l’Effectif.</p>}
          </section>
          <section className="actions-match" aria-label="Statistiques">
            <p className="consigne">{choisi ? `Pour ${nom(choisi)} :` : 'Touche d’abord un joueur.'}</p>
            <div className="grille-stats">
              {STATS.map(([s, texte]) => (
                <button key={s} className={`bouton stat ${s}`} disabled={!choisi} onClick={() => noter(s)}>{texte}</button>
              ))}
            </div>
            <div className="adverse" role="group" aria-label="Points adverses">
              <span>{m.adversaire}</span>
              {[1, 2, 3].map((p) => (
                <button key={p} className="bouton" onClick={() => maj({ adverses: [...m.adverses, { id: nouvelId('ad'), quart: m.quart, points: p }] })}>+{p}</button>
              ))}
              <button className="bouton" disabled={!m.adverses.length} aria-label="Retirer les derniers points adverses"
                onClick={() => maj({ adverses: m.adverses.slice(0, -1) })}><Icone.annuler /></button>
            </div>
            <div className="journal">
              <span role="status">{dernier ?? 'Aucune action notée.'}</span>
              <button className="bouton" disabled={!m.evenements.length} onClick={annulerDernier}><Icone.annuler />Annuler la dernière action</button>
            </div>
          </section>
        </div>
      ) : (
        <FeuilleMatch match={m} equipe={equipe} onSupprimer={onSupprimer} />
      )}
    </main>
  )
}

function FeuilleMatch({ match: m, equipe, onSupprimer }: { match: Match; equipe?: Equipe; onSupprimer(): void }) {
  const joueurs = (equipe?.joueurs ?? []).filter((j) => m.presents.includes(j.id))
  const lignes = joueurs.map((j) => ({ j, f: feuille(m, j.id) }))
  const somme = (k: 'pts' | 'rebonds' | 'passes' | 'interceptions' | 'contres' | 'pertes' | 'fautes') => lignes.reduce((s, l) => s + l.f[k], 0)
  const tirs = (k: 'tir2' | 'tir3' | 'lf') => `${lignes.reduce((s, l) => s + l.f[k][0], 0)}/${lignes.reduce((s, l) => s + l.f[k][1], 0)}`
  return (
    <div className="feuille-match">
      <table>
        <thead>
          <tr><th>Joueur</th><th>Pts</th><th>2 pts</th><th>3 pts</th><th>LF</th><th>Reb.</th><th>Pd</th><th>Int.</th><th>Ct</th><th>Pb</th><th>F</th></tr>
        </thead>
        <tbody>
          {lignes.map(({ j, f }) => (
            <tr key={j.id}>
              <th>{j.maillot} {j.nom}</th><td>{f.pts}</td><td>{f.tir2.join('/')}</td><td>{f.tir3.join('/')}</td><td>{f.lf.join('/')}</td>
              <td>{f.rebonds} ({f.rebOff}+{f.rebDef})</td><td>{f.passes}</td><td>{f.interceptions}</td><td>{f.contres}</td><td>{f.pertes}</td><td>{f.fautes}</td>
            </tr>
          ))}
          <tr className="total">
            <th>Équipe</th><td>{somme('pts')}</td><td>{tirs('tir2')}</td><td>{tirs('tir3')}</td><td>{tirs('lf')}</td>
            <td>{somme('rebonds')}</td><td>{somme('passes')}</td><td>{somme('interceptions')}</td><td>{somme('contres')}</td><td>{somme('pertes')}</td><td>{somme('fautes')}</td>
          </tr>
        </tbody>
      </table>
      <p className="legende-feuille">Pd : passes décisives, Int. : interceptions, Ct : contres, Pb : pertes de balle, F : fautes. Tirs : réussis/tentés.</p>
      <table className="quarts-temps">
        <thead><tr><th />{scoreParQuart(m).map((q) => <th key={q.quart}>{nomQuart(q.quart)}</th>)}</tr></thead>
        <tbody>
          <tr><th>{equipe?.nom ?? 'Nous'}</th>{scoreParQuart(m).map((q) => <td key={q.quart}>{q.nous}</td>)}</tr>
          <tr><th>{m.adversaire}</th>{scoreParQuart(m).map((q) => <td key={q.quart}>{q.eux}</td>)}</tr>
        </tbody>
      </table>
      <button className="bouton danger" onClick={() => confirm(`Supprimer le match contre ${m.adversaire} ?`) && onSupprimer()}>
        <Icone.corbeille />Supprimer le match
      </button>
    </div>
  )
}
