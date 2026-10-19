import { useEffect, useMemo, useRef, useState, type PointerEvent as PE } from 'react'
import type { Ecran } from '../App.tsx'
import { aRetravailler, campActif, dernierResultat, postes, questionsPour, TOLERANCE, verifier, type Question } from '../modele/revision.ts'
import { nouvelId, type Etape, type Point, type Resultat, type Systeme, type TypeAction } from '../modele/types.ts'
import { Icone } from './Icones.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { maintenant } from './texte.ts'
import { useLecture } from './useLecture.tsx'
import { borner, depuisEcran, versEcran } from './vue.ts'

const PHRASES: Record<TypeAction | 'rien', string> = {
  coupe: 'il coupe', passe: 'il passe', dribble: 'il dribble', ecran: 'il pose un écran', rien: 'il ne bouge pas',
}
const CHOIX: [TypeAction | 'rien', string][] = [['coupe', 'Coupe'], ['passe', 'Passe'], ['dribble', 'Dribble'], ['ecran', 'Écran'], ['rien', 'Ne bouge pas']]

const nom = (e: Etape, id: string) => {
  const j = e.joueurs.find((x) => x.id === id)
  return !j ? '?' : j.camp === 'defense' ? `X${j.numero}` : j.camp === 'coach' ? 'coach' : String(j.numero)
}

// Ce qu'il fallait répondre, en clair.
function resume(doc: Systeme, q: Question) {
  const e = doc.etapes[q.etape]
  if (q.type === 'quoi') return `le ${nom(e, q.joueur)} : ${PHRASES[q.reponse]}`
  if (q.type === 'ou') return `où va le ${nom(e, q.joueur)}`
  return `le ${nom(e, q.joueur)} passe au ${nom(e, q.reponse)}`
}

// ---------- Accueil : scores et systèmes à retravailler ----------

interface AccueilProps { documents: Systeme[]; resultats: Resultat[]; ouvrir(e: Ecran): void }

export function RevisionAccueil({ documents, resultats, ouvrir }: AccueilProps) {
  const lignes = documents
    .filter((d) => questionsPour(d, null).length)
    .map((d) => ({ d, r: dernierResultat(resultats, d.id) }))
  const score = (r?: Resultat) => (r ? r.bonnes / r.total : -1)
  const aRevoir = lignes.filter(({ r }) => aRetravailler(r)).sort((a, b) => score(a.r) - score(b.r))
  const sus = lignes.filter(({ r }) => !aRetravailler(r)).sort((a, b) => a.d.nom.localeCompare(b.d.nom, 'fr'))
  const liste = (titre: string, l: typeof lignes) => l.length > 0 && (
    <section>
      <h2 className="titre-section">{titre}</h2>
      <ul className="liste-revision">
        {l.map(({ d, r }) => (
          <li key={d.id}>
            <div>
              <strong>{d.nom}</strong>
              <span>{d.categorie}, {r ? `dernier score ${r.bonnes} / ${r.total}` : 'pas encore révisé'}</span>
            </div>
            <button className="bouton" onClick={() => ouvrir({ quoi: 'grand', id: d.id, retour: { quoi: 'bibliotheque' } })}>Regarder</button>
            <button className="bouton principal" onClick={() => ouvrir({ quoi: 'revision', id: d.id })}><Icone.lire />Réviser</button>
          </li>
        ))}
      </ul>
    </section>
  )
  return (
    <>
      <p className="intro">Choisis un système, ton poste, puis réponds : que fait ton joueur, où va-t-il, à qui passe-t-il ?</p>
      {!lignes.length && <p className="vide">Rien à réviser pour l’instant : il faut des systèmes avec des actions.</p>}
      {liste('À retravailler', aRevoir)}
      {liste('Bien su', sus)}
    </>
  )
}

// ---------- Une révision ----------

interface RevisionProps { doc: Systeme; onFermer(): void; onResultat(r: Resultat): void }

export function Revision({ doc, onFermer, onResultat }: RevisionProps) {
  const [poste, setPoste] = useState<number | null | undefined>(undefined)
  const [essai, setEssai] = useState(0)
  const camp = campActif(doc)
  return (
    <main className="revision">
      <header className="barre">
        <button className="bouton" onClick={onFermer}><Icone.retour />Retour</button>
        <strong className="titre-revision">{doc.nom}</strong>
      </header>
      {poste === undefined ? (
        <div className="choix-poste">
          <h2>Quel poste joues-tu ?</h2>
          <div className="numeros-poste">
            {postes(doc).map((n) => (
              <button key={n} className="numero" onClick={() => setPoste(n)}>{camp === 'defense' ? `X${n}` : n}</button>
            ))}
          </div>
          <button className="bouton large principal" onClick={() => setPoste(null)}>Tous les postes</button>
        </div>
      ) : (
        <Quiz key={`${poste}-${essai}`} doc={doc} poste={poste} onResultat={onResultat} onFermer={onFermer}
          recommencer={() => setEssai((x) => x + 1)} changerPoste={() => setPoste(undefined)} />
      )}
    </main>
  )
}

interface QuizProps {
  doc: Systeme
  poste: number | null
  onResultat(r: Resultat): void
  onFermer(): void
  recommencer(): void
  changerPoste(): void
}

function Quiz({ doc, poste, onResultat, onFermer, recommencer, changerPoste }: QuizProps) {
  const questions = useMemo(() => questionsPour(doc, poste), [doc, poste])
  const [reponses, setReponses] = useState<{ valeur: string | Point; juste: boolean }[]>([])
  const [n, setN] = useState(0)
  const bonnes = reponses.filter((r) => r.juste).length
  const fini = questions.length > 0 && n >= questions.length
  const enregistre = useRef(false)

  useEffect(() => {
    if (!fini || enregistre.current) return
    enregistre.current = true
    onResultat({ id: nouvelId('r'), document: doc.id, date: maintenant(), poste, bonnes, total: questions.length })
  }, [fini, onResultat, doc.id, poste, bonnes, questions.length])

  if (!questions.length) return (
    <div className="fin-revision">
      <p>Rien à réviser pour ce poste : aucune action dans ce système.</p>
      <button className="bouton principal" onClick={changerPoste}>Choisir un autre poste</button>
    </div>
  )

  if (fini) {
    const ratees = questions.filter((_, k) => !reponses[k].juste)
    return (
      <div className="fin-revision">
        <p className="score"><strong>{bonnes} / {questions.length}</strong></p>
        <p>{bonnes >= 0.8 * questions.length ? 'Bien joué, ce système est su !' : 'À retravailler : refais-le bientôt.'}</p>
        {ratees.length > 0 && (
          <>
            <h3>À revoir</h3>
            <ul>{ratees.map((q, k) => <li key={k}>Étape {q.etape + 1} : {resume(doc, q)}</li>)}</ul>
          </>
        )}
        <div className="boutons">
          <button className="bouton principal" onClick={recommencer}>Recommencer</button>
          <button className="bouton" onClick={changerPoste}>Changer de poste</button>
          <button className="bouton" onClick={onFermer}>Terminer</button>
        </div>
      </div>
    )
  }

  return (
    <QuestionVue key={n} doc={doc} q={questions[n]} rang={n} total={questions.length} reponse={reponses[n]}
      onRepondre={(valeur) => setReponses((r) => [...r, { valeur, juste: verifier(questions[n], valeur) }])}
      onSuivant={() => setN(n + 1)} />
  )
}

interface QuestionProps {
  doc: Systeme
  q: Question
  rang: number
  total: number
  reponse?: { valeur: string | Point; juste: boolean }
  onRepondre(v: string | Point): void
  onSuivant(): void
}

function QuestionVue({ doc, q, rang, total, reponse, onRepondre, onSuivant }: QuestionProps) {
  const etape = doc.etapes[q.etape]
  const [pos, setPos] = useState<Point | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const l = useLecture([etape])
  const nomJoueur = nom(etape, q.joueur)

  // Une fois la réponse donnée, l'étape se joue : c'est la correction.
  useEffect(() => {
    if (reponse) l.jouerEtape()
  }, [!!reponse]) // seulement au moment où la réponse arrive

  const versTerrain = (e: PE): Point => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current!.getScreenCTM()!.inverse())
    return borner(doc.terrain, depuisEcran(doc.terrain, [p.x, p.y]))
  }
  const placer = (e: PE<SVGSVGElement>) => {
    if (reponse || q.type !== 'ou' || (e.type === 'pointermove' && !e.buttons)) return
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId)
    setPos(versTerrain(e))
  }
  const toucherJoueur = (e: PE<SVGSVGElement>) => {
    if (reponse || q.type !== 'qui') return
    const id = (e.target as Element).closest?.('[data-joueur]')?.getAttribute('data-joueur')
    const j = etape.joueurs.find((x) => x.id === id)
    if (j && j.id !== q.joueur && j.camp !== 'defense') onRepondre(j.id)
  }

  const montree: Etape = reponse ? etape : {
    ...etape,
    actions: [],
    joueurs: etape.joueurs.map((j) => (j.id === q.joueur && pos ? { ...j, x: pos[0], y: pos[1] } : j)),
  }
  const surligne: Record<string, 'question' | 'juste' | 'faux'> = { [q.joueur]: 'question' }
  if (reponse && q.type === 'qui') {
    surligne[q.reponse] = 'juste'
    if (!reponse.juste) surligne[reponse.valeur as string] = 'faux'
  }
  const E = (p: Point) => versEcran(doc.terrain, p)
  const consigne = {
    quoi: `Que fait le ${nomJoueur} ?`,
    ou: `Où va le ${nomJoueur} ? Glisse-le ou touche l’endroit, puis valide.`,
    qui: `À qui passe le ${nomJoueur} ? Touche le receveur.`,
  }[q.type]
  const correction = !reponse ? '' : reponse.juste ? 'Juste !' : {
    quoi: q.type === 'quoi' ? `Non : ${PHRASES[q.reponse]}.` : '',
    ou: 'Non : il arrive dans le cercle vert.',
    qui: q.type === 'qui' ? `Non : il passe au ${nom(etape, q.reponse)}.` : '',
  }[q.type]

  return (
    <div className={`question ${doc.terrain.vue === 'entier' ? 'entier' : 'demi'}`}>
      <div className="zone-terrain">
        <TerrainSvg ref={svg} terrain={doc.terrain} etape={montree} anime={l.anime} materiel={doc.materiel} surligne={surligne}
          onPointerDown={(e) => { placer(e) }} onPointerMove={placer} onPointerUp={toucherJoueur} onContextMenu={(e) => e.preventDefault()}>
          {reponse && q.type === 'ou' && (
            <>
              <circle cx={E(q.cible)[0]} cy={E(q.cible)[1]} r={TOLERANCE} className="cible" />
              {!reponse.juste && (() => {
                const [x, y] = E(reponse.valeur as Point)
                return <path d={`M${x - 0.35} ${y - 0.35} L${x + 0.35} ${y + 0.35} M${x + 0.35} ${y - 0.35} L${x - 0.35} ${y + 0.35}`} className="erreur" />
              })()}
            </>
          )}
        </TerrainSvg>
      </div>
      <section className="panneau-question" aria-live="polite">
        <p className="avancement">Étape {q.etape + 1} sur {doc.etapes.length}, question {rang + 1} sur {total}</p>
        <h2>{consigne}</h2>
        {!reponse && q.type === 'quoi' && (
          <div className="reponses">
            {CHOIX.map(([t, texte]) => <button key={t} className="bouton" onClick={() => onRepondre(t)}>{texte}</button>)}
          </div>
        )}
        {!reponse && q.type === 'ou' && (
          <button className="bouton principal large" disabled={!pos} onClick={() => pos && onRepondre(pos)}>Valider</button>
        )}
        {reponse && (
          <>
            <p className={`correction ${reponse.juste ? 'juste' : 'faux'}`}>{correction}</p>
            {etape.description && <p className="texte-etape">{etape.description}</p>}
            <div className="boutons">
              <button className="bouton" onClick={l.jouerEtape} disabled={!!l.lecture}><Icone.lire />Revoir</button>
              <button className="bouton principal" onClick={onSuivant}>{rang + 1 < total ? 'Question suivante' : 'Voir le score'}</button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
