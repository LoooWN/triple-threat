import { useState } from 'react'
import type { Donnees } from '../App.tsx'
import { saison } from '../modele/stats.ts'
import { nouvelId, type Equipe, type JoueurEffectif, type Match } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { maintenant } from './texte.ts'

export function Effectif({ equipes, matchs }: { equipes: Donnees['equipes']; matchs: Match[] }) {
  const [aFocaliser, setAFocaliser] = useState<string | null>(null)
  const liste = [...(equipes.elements ?? [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const garder = (e: Equipe, changement: Partial<Equipe>) => equipes.garder({ ...e, ...changement, modifieLe: maintenant() })
  const majJoueur = (e: Equipe, id: string, p: Partial<JoueurEffectif>) =>
    garder(e, { joueurs: e.joueurs.map((j) => (j.id === id ? { ...j, ...p } : j)) })

  return (
    <>
      <div className="outils-liste">
        <p className="intro">Les numéros de maillot s’affichent sur le terrain : dans un système, touche un joueur puis choisis son maillot.</p>
        <button className="bouton principal" onClick={() => {
          const nom = prompt('Nom de l’équipe (ex. : U15 F)')?.trim()
          if (nom) equipes.garder({ id: nouvelId('eq'), nom, joueurs: [], modifieLe: maintenant() })
        }}><Icone.plus />Nouvelle équipe</button>
      </div>
      {equipes.elements && !liste.length && <p className="vide">Aucune équipe pour l’instant.</p>}

      {liste.map((e) => {
        const vus = e.joueurs.map((j) => j.maillot).filter(Boolean)
        const doublons = new Set(vus.filter((m, k) => vus.indexOf(m) !== k))
        return (
          <section key={e.id} className="equipe" aria-label={e.nom}>
            <header>
              <h2>{e.nom}</h2>
              <button className="bouton" onClick={() => {
                const nom = prompt('Nom de l’équipe', e.nom)?.trim()
                if (nom) garder(e, { nom })
              }}>Renommer</button>
              <button className="bouton danger" onClick={() => {
                if (confirm(`Supprimer l’équipe « ${e.nom} » ? Les systèmes afficheront de nouveau les numéros de poste.`)) equipes.retirer(e.id)
              }}><Icone.corbeille />Supprimer</button>
            </header>
            <ul className="joueurs">
              {e.joueurs.map((j) => (
                <li key={j.id}>
                  <input className={`maillot${doublons.has(j.maillot) ? ' double' : ''}`} inputMode="numeric" maxLength={2}
                    placeholder="N°" aria-label="Numéro de maillot" value={j.maillot}
                    onChange={(ev) => majJoueur(e, j.id, { maillot: ev.target.value.replace(/\D/g, '').slice(0, 2) })} />
                  <input className="nom-joueur" placeholder="Prénom" aria-label="Prénom" value={j.nom} autoFocus={aFocaliser === j.id}
                    onChange={(ev) => majJoueur(e, j.id, { nom: ev.target.value })} />
                  <button className="bouton rond" aria-label={`Retirer ${j.nom || 'ce joueur'}`}
                    onClick={() => garder(e, { joueurs: e.joueurs.filter((x) => x.id !== j.id) })}><Icone.corbeille /></button>
                </li>
              ))}
            </ul>
            {doublons.size > 0 && <p className="alerte">Numéro en double : {[...doublons].join(', ')}</p>}
            {matchs.some((m) => m.equipe === e.id) && (
              <div className="stats-saison">
                <h3>Moyennes par match ({matchs.filter((m) => m.equipe === e.id).length} matchs notés)</h3>
                <table>
                  <thead><tr><th>Joueur</th><th>Matchs</th><th>Pts</th><th>Reb.</th><th>Pd</th><th>Int.</th><th>Pb</th><th>F</th><th>LF</th></tr></thead>
                  <tbody>
                    {e.joueurs.map((j) => {
                      const s = saison(matchs.filter((m) => m.equipe === e.id), j.id)
                      return (
                        <tr key={j.id}>
                          <th>{j.maillot} {j.nom}</th><td>{s.matchs}</td><td>{s.moyennes.pts}</td><td>{s.moyennes.rebonds}</td><td>{s.moyennes.passes}</td>
                          <td>{s.moyennes.interceptions}</td><td>{s.moyennes.pertes}</td><td>{s.moyennes.fautes}</td><td>{s.pourcentageLf === null ? '–' : `${s.pourcentageLf} %`}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <button className="bouton" onClick={() => {
              const j = { id: nouvelId('j'), nom: '', maillot: '' }
              setAFocaliser(j.id)
              garder(e, { joueurs: [...e.joueurs, j] })
            }}><Icone.plus />Ajouter un joueur</button>
          </section>
        )
      })}
    </>
  )
}
