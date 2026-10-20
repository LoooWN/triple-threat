import { useEffect, useState } from 'react'
import { Icone } from './Icones.tsx'
import { pluriel } from './texte.ts'

interface Paquet { id: string; titre: string; description: string; credits: string; exercices: number; systemes: number; seances: number }

// Paquets livrés avec l'appli (public/contenus, générés par `npm run contenus`) : mis en cache à l'installation, donc dispo hors ligne.
const DOSSIER = `${import.meta.env.BASE_URL}contenus/`

export function ContenusToutFaits({ ajouter, onFermer }: { ajouter(texte: string): void; onFermer(): void }) {
  const [paquets, setPaquets] = useState<Paquet[] | null>(null)
  const [erreur, setErreur] = useState(false)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    fetch(`${DOSSIER}index.json`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setPaquets, () => setErreur(true))
  }, [])

  const choisir = async (p: Paquet) => {
    setEnCours(true)
    try {
      const r = await fetch(`${DOSSIER}${p.id}.json`)
      if (!r.ok) throw new Error()
      ajouter(await r.text())
      onFermer()
    } catch {
      alert('Impossible de charger ce paquet. Réessaie avec une connexion internet.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="fenetre contenus" role="dialog" aria-label="Contenus tout faits">
        <h2>Contenus tout faits</h2>
        <p className="intro">Des exercices, systèmes et séances prêts à l’emploi, à modifier comme les tiens. Rien n’est ajouté en double : tu peux recommencer sans risque.</p>
        {erreur && <p className="alerte">Liste indisponible. Réessaie avec une connexion internet.</p>}
        {!paquets && !erreur && <p>Chargement…</p>}
        <ul>
          {paquets?.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.titre}</strong>
                <span>{p.description}</span>
                <small>
                  {([[p.exercices, 'exercice'], [p.systemes, 'système'], [p.seances, 'séance']] as const)
                    .filter(([n]) => n).map(([n, mot]) => pluriel(n, mot)).join(', ')}. {p.credits}
                </small>
              </div>
              <button className="bouton principal" disabled={enCours} aria-label={`Ajouter ${p.titre}`} onClick={() => choisir(p)}>
                <Icone.plus />Ajouter
              </button>
            </li>
          ))}
        </ul>
        <div className="boutons"><button className="bouton" onClick={onFermer}>Fermer</button></div>
      </div>
    </div>
  )
}
