import { useRef, useState } from 'react'
import type { Donnees, Ecran } from '../App.tsx'
import { categoriesDe, nouveauDocument, rechercher, variante } from '../modele/documents.ts'
import { exporter, importer } from '../modele/fichier.ts'
import type { Equipe, Genre, Seance, Systeme } from '../modele/types.ts'
import { dernierTerrain, partagerFichier, retenirTerrain } from '../stockage.ts'
import { Effectif } from './Effectif.tsx'
import { imageDocument, pdfDocuments } from './export.tsx'
import { Icone } from './Icones.tsx'
import { Message, useMessage } from './Message.tsx'
import { RevisionAccueil } from './Revision.tsx'
import { ListeSeances } from './Seances.tsx'
import { ChoixCategorie, ReglageTerrain } from './ReglageTerrain.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { maintenant, nomFichier, pluriel } from './texte.ts'
import { useExport } from './useExport.tsx'
import { useLien } from './useLien.tsx'

export type Onglet = Genre | 'seances' | 'effectif' | 'revision'
const ONGLETS: [Onglet, string][] = [['systeme', 'Systèmes'], ['exercice', 'Exercices'], ['seances', 'Séances'], ['effectif', 'Effectif'], ['revision', 'Révision']]

interface Props { donnees: Donnees; revisables: Systeme[]; onglet: Onglet; setOnglet(o: Onglet): void; ouvrir(e: Ecran): void }

export function Bibliotheque({ donnees, revisables, onglet, setOnglet, ouvrir }: Props) {
  const [message, montrer] = useMessage()
  const fichier = useRef<HTMLInputElement>(null)
  const { systemes, seances, equipes } = donnees
  const tout = { systemes: systemes.elements ?? [], seances: seances.elements ?? [], equipes: equipes.elements ?? [] }

  const importerFichier = async (f: File | undefined) => {
    if (!f) return
    try {
      const r = importer(await f.text(), tout)
      r.systemes.forEach(systemes.garder)
      r.seances.forEach(seances.garder)
      r.equipes.forEach(equipes.garder)
      const morceaux = ([
        [r.systemes.filter((s) => s.genre === 'systeme').length, 'système'],
        [r.systemes.filter((s) => s.genre === 'exercice').length, 'exercice'],
        [r.seances.length, 'séance'],
        [r.equipes.length, 'équipe'],
      ] as const).filter(([n]) => n).map(([n, mot]) => pluriel(n, mot))
      const deja = r.dejaPresents ? ` (${r.dejaPresents} déjà sur cet iPad)` : ''
      montrer(morceaux.length ? `Importé : ${morceaux.join(', ')}.${deja}` : r.dejaPresents ? 'Tout est déjà sur cet iPad.' : 'Ce fichier est vide.')
    } catch (e) {
      alert((e as Error).message)
    } finally {
      if (fichier.current) fichier.current.value = ''
    }
  }

  const toutSauvegarder = () => {
    if (!tout.systemes.length && !tout.seances.length && !tout.equipes.length) return montrer('Rien à sauvegarder pour l’instant.')
    partagerFichier(`triple-threat-sauvegarde-${maintenant().slice(0, 10)}.json`, exporter(tout))
  }

  const joueur = systemes.elements && !systemes.elements.length && (donnees.paquets.elements ?? []).length > 0
  if (joueur) return (
    <main className="bibliotheque">
      <header className="entete">
        <h1><img src={`${import.meta.env.BASE_URL}icone.svg`} alt="" />Triple Threat</h1>
      </header>
      <RevisionAccueil documents={revisables} resultats={donnees.resultats.elements ?? []} paquets={donnees.paquets} ouvrir={ouvrir} />
      <p className="conseil">Tes scores restent sur ce téléphone. Si un système disparaît, rouvre le lien envoyé par le coach.</p>
      <Message texte={message} />
    </main>
  )

  return (
    <main className="bibliotheque">
      <header className="entete">
        <h1><img src={`${import.meta.env.BASE_URL}icone.svg`} alt="" />Triple Threat</h1>
        <div className="actions-entete">
          <button className="bouton" onClick={() => fichier.current?.click()}><Icone.importer />Importer</button>
          <button className="bouton" onClick={toutSauvegarder}><Icone.partager />Tout sauvegarder</button>
          <input ref={fichier} type="file" accept="application/json,.json" hidden onChange={(e) => importerFichier(e.target.files?.[0])} />
        </div>
      </header>

      <nav className="onglets" role="tablist" aria-label="Bibliothèque">
        {ONGLETS.map(([o, nom]) => (
          <button key={o} role="tab" aria-selected={onglet === o} onClick={() => setOnglet(o)}>{nom}</button>
        ))}
      </nav>

      {(onglet === 'systeme' || onglet === 'exercice') && (
        <ListeDocuments genre={onglet} systemes={systemes} seances={tout.seances} equipes={tout.equipes} ouvrir={ouvrir} montrer={montrer} />
      )}
      {onglet === 'seances' && <ListeSeances seances={seances} documents={tout.systemes} ouvrir={ouvrir} />}
      {onglet === 'effectif' && <Effectif equipes={equipes} />}
      {onglet === 'revision' && <RevisionAccueil documents={revisables} resultats={donnees.resultats.elements ?? []} paquets={donnees.paquets} ouvrir={ouvrir} />}

      <p className="conseil">
        Tout reste sur cet iPad. Safari peut effacer les données d’une appli peu utilisée :
        fais « Tout sauvegarder » de temps en temps et range le fichier dans Fichiers ou iCloud.
      </p>
      <Message texte={message} />
    </main>
  )
}

const MOTS = {
  systeme: { un: 'système', ce: 'ce système', nouveau: 'Nouveau système', aucun: 'Aucun système pour l’instant. Crée le premier, ou importe une sauvegarde.' },
  exercice: { un: 'exercice', ce: 'cet exercice', nouveau: 'Nouvel exercice', aucun: 'Aucun exercice pour l’instant. Crée le premier, ou importe une sauvegarde.' },
}

interface ListeProps {
  genre: Genre
  systemes: Donnees['systemes']
  seances: Seance[]
  equipes: Equipe[]
  ouvrir(e: Ecran): void
  montrer(t: string): void
}

function ListeDocuments({ genre, systemes, seances, equipes, ouvrir, montrer }: ListeProps) {
  const exp = useExport()
  const lien = useLien(montrer)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<string | null>(null)
  const [creation, setCreation] = useState(false)
  const [menuDe, setMenuDe] = useState<Systeme | null>(null)
  const [categorieDe, setCategorieDe] = useState<Systeme | null>(null)
  const mots = MOTS[genre]
  const tous = (systemes.elements ?? []).filter((d) => d.genre === genre)
  const categories = categoriesDe(genre, tous)
  const trouves = rechercher(tous.filter((d) => !filtre || d.categorie === filtre), recherche)
    .sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
  // Sans recherche ni filtre : rangé par catégorie, comme un playbook.
  const groupes: [string | null, Systeme[]][] = !recherche.trim() && !filtre
    ? categories.map((c): [string, Systeme[]] => [c, trouves.filter((d) => d.categorie === c)]).filter(([, l]) => l.length)
    : [[null, trouves]]
  const garder = (s: Systeme) => systemes.garder({ ...s, modifieLe: maintenant() })

  return (
    <>
      <div className="outils-liste">
        <input type="search" className="recherche" placeholder="Rechercher un nom, une catégorie, un mot de la description…"
          aria-label="Rechercher" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        <button className="bouton" disabled={!trouves.length} onClick={() => {
          const titre = filtre ?? (recherche.trim() ? `Recherche « ${recherche.trim()} »` : genre === 'systeme' ? 'Tous les systèmes' : 'Tous les exercices')
          exp.lancer(`playbook-${nomFichier(titre)}.pdf`, () => pdfDocuments(trouves, equipes, titre))
        }}><Icone.pdf />Playbook PDF</button>
        <button className="bouton" disabled={!trouves.length} onClick={() => {
          const titre = filtre ?? (recherche.trim() ? recherche.trim() : genre === 'systeme' ? 'Systèmes' : 'Exercices')
          lien.preparer(titre, trouves)
        }}><Icone.partager />Lien de révision</button>
        <button className="bouton principal" onClick={() => setCreation(true)}><Icone.plus />{mots.nouveau}</button>
      </div>
      {tous.length > 0 && (
        <div className="filtres segments" role="group" aria-label="Catégories">
          <button aria-pressed={!filtre} onClick={() => setFiltre(null)}>Toutes</button>
          {categories.filter((c) => tous.some((d) => d.categorie === c)).map((c) => (
            <button key={c} aria-pressed={filtre === c} onClick={() => setFiltre(filtre === c ? null : c)}>{c}</button>
          ))}
        </div>
      )}

      {groupes.map(([c, liste]) => (
        <section key={c ?? 'resultats'}>
          {c && <h2 className="titre-section">{c}</h2>}
          <ul className="grille">
            {liste.map((s) => (
              <li key={s.id} className="carte">
                <button className="vignette" onClick={() => ouvrir({ quoi: 'editeur', id: s.id })} aria-label={`Ouvrir ${s.nom}`}>
                  <TerrainSvg terrain={s.terrain} etape={s.etapes[0]} aria-hidden="true" />
                </button>
                <div className="legende">
                  <div>
                    <strong>{s.nom}</strong>
                    <span>{pluriel(s.etapes.length, 'étape')}, {s.terrain.vue === 'demi' ? 'demi-terrain' : 'terrain entier'}</span>
                  </div>
                  <button className="bouton rond" aria-label={`Options de ${s.nom}`} onClick={() => setMenuDe(s)}><Icone.plusDe /></button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!tous.length && <p className="vide">{mots.aucun}</p>}
      {tous.length > 0 && !trouves.length && <p className="vide">Aucun résultat.</p>}

      {creation && (
        <ReglageTerrain titre={mots.nouveau} bouton="Créer" nom="" categories={categories} categorie={filtre ?? categories[0]}
          terrain={dernierTerrain()} onAnnuler={() => setCreation(false)}
          onValider={(nom, t, categorie) => {
            retenirTerrain(t)
            const d = nouveauDocument(genre, nom, t, categorie)
            systemes.garder(d)
            ouvrir({ quoi: 'editeur', id: d.id })
          }} />
      )}

      {menuDe && (
        <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && setMenuDe(null)}>
          <div className="fenetre petite" role="dialog" aria-label={menuDe.nom}>
            <h2>{menuDe.nom}</h2>
            <button className="bouton large" onClick={() => {
              const nom = prompt(`Nouveau nom de ${mots.ce}`, menuDe.nom)?.trim()
              if (nom) garder({ ...menuDe, nom })
              setMenuDe(null)
            }}>Renommer</button>
            <button className="bouton large" onClick={() => ouvrir({ quoi: 'grand', id: menuDe.id, retour: { quoi: 'bibliotheque' } })}>
              <Icone.lire />Présenter en grand
            </button>
            <button className="bouton large" onClick={() => { setCategorieDe(menuDe); setMenuDe(null) }}>Changer de catégorie</button>
            <button className="bouton large" onClick={() => {
              systemes.garder(variante(menuDe))
              montrer(`« ${menuDe.nom} – variante » créée.`)
              setMenuDe(null)
            }}><Icone.dupliquer />Dupliquer en variante</button>
            <button className="bouton large" onClick={() => {
              const d = menuDe
              setMenuDe(null)
              lien.preparer(d.nom, [d])
            }}><Icone.partager />Lien de révision pour les joueurs</button>
            <button className="bouton large" onClick={() => {
              const d = menuDe
              setMenuDe(null)
              exp.lancer(`${nomFichier(d.nom)}.pdf`, () => pdfDocuments([d], equipes))
            }}><Icone.pdf />PDF à imprimer</button>
            <button className="bouton large" onClick={() => {
              const d = menuDe
              setMenuDe(null)
              exp.lancer(`${nomFichier(d.nom)}.png`, () => imageDocument(d, equipes))
            }}><Icone.image />Image avec toutes les étapes</button>
            <button className="bouton large" onClick={() => {
              partagerFichier(`${nomFichier(menuDe.nom)}.json`, exporter({ systemes: [menuDe] }))
              setMenuDe(null)
            }}><Icone.partager />Fichier pour un autre iPad</button>
            <button className="bouton large danger" onClick={() => {
              const n = seances.filter((se) => se.blocs.some((b) => b.document === menuDe.id)).length
              const dans = n ? ` Il est utilisé dans ${pluriel(n, 'séance')}, où il sera ignoré.` : ''
              if (confirm(`Supprimer « ${menuDe.nom} » ? Cette action est définitive.${dans}`)) systemes.retirer(menuDe.id)
              setMenuDe(null)
            }}><Icone.corbeille />Supprimer</button>
            <button className="bouton large" onClick={() => setMenuDe(null)}>Fermer</button>
          </div>
        </div>
      )}

      {categorieDe && (
        <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && setCategorieDe(null)}>
          <div className="fenetre petite" role="dialog" aria-label="Catégorie">
            <h2>{categorieDe.nom}</h2>
            <ChoixCategorie categories={categories} valeur={categorieDe.categorie}
              onChange={(c) => { garder({ ...categorieDe, categorie: c }); setCategorieDe(null) }} />
            <button className="bouton large" onClick={() => setCategorieDe(null)}>Fermer</button>
          </div>
        </div>
      )}
      {exp.fenetre}
      {lien.fenetre}
    </>
  )
}
