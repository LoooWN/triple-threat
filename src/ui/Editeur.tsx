import { useEffect, useRef, useState, type JSX, type PointerEvent as PE } from 'react'
import { etatAnime, nombreTemps } from '../modele/animation.ts'
import { placerDefense } from '../modele/defense.ts'
import { attacherTrait, changerChemin, changerNumero, deplacerJoueur, etapeSuivante, propager, receveurPasse, retirerJoueur } from '../modele/etapes.ts'
import { polyligne } from '../modele/geometrie.ts'
import { lisserTrace } from '../modele/lissage.ts'
import { miroirEtape, miroirSysteme } from '../modele/miroir.ts'
import { nouvelId, type Action, type Camp, type Etape, type Point, type Systeme, type TypeAction } from '../modele/types.ts'
import { retenirTerrain } from '../stockage.ts'
import { ApercuType, Icone } from './Icones.tsx'
import { Message, useMessage } from './Message.tsx'
import { ReglageTerrain } from './ReglageTerrain.tsx'
import { TerrainSvg } from './Terrain.tsx'
import { useHistorique } from './useHistorique.ts'
import { borner, depuisEcran } from './vue.ts'

type Mode = 'placer' | 'dessiner' | 'defense' | 'texte'
type Cible = { type: 'joueur' | 'action' | 'texte' | 'poignee'; id: string }
interface Geste { cible: Cible | null; client: [number, number]; debut: Point; pts: Point[]; bouge: boolean; dessin: boolean; long: boolean }

const ENCRE = '#1b2430'
const ROUGE = '#b8322a'
const COULEURS = [ENCRE, ROUGE, '#1f5fa8', '#2e7d4f', '#7a3fa0']
const TYPES: [TypeAction, string][] = [['coupe', 'Coupe'], ['passe', 'Passe'], ['dribble', 'Dribble'], ['ecran', 'Écran']]
const DUREE_TEMPS = 1800 // ms par « temps » d'une étape, à vitesse ×1

function lireCible(el: EventTarget): Cible | null {
  const c = (el as Element).closest?.('[data-poignee],[data-joueur],[data-texte],[data-action]') as SVGElement | null
  if (!c) return null
  const d = c.dataset
  if (d.poignee !== undefined) return { type: 'poignee', id: d.poignee }
  if (d.joueur) return { type: 'joueur', id: d.joueur }
  if (d.texte) return { type: 'texte', id: d.texte }
  return { type: 'action', id: d.action! }
}

// Place un menu près du doigt sans qu'il sorte de l'écran.
const pres = (x: number, y: number, l = 340, h = 230) => ({
  left: Math.min(Math.max(8, x - l / 2), innerWidth - l - 8),
  top: y - h - 30 > 8 ? y - h - 30 : Math.min(y + 30, innerHeight - h - 8),
})

interface Props { initial: Systeme; onChange(s: Systeme): void; onFermer(): void }

export function Editeur({ initial, onChange, onFermer }: Props) {
  const h = useHistorique(initial)
  const s = h.valeur
  const [iBrut, setI] = useState(0)
  const i = Math.min(iBrut, s.etapes.length - 1)
  const etape = s.etapes[i]
  const [mode, setMode] = useState<Mode>('placer')
  const [selection, setSelection] = useState<string | null>(null)
  const [apercu, setApercuEtat] = useState<Etape | null>(null)
  const apercuRef = useRef<Etape | null>(null)
  const [trait, setTrait] = useState<Point[] | null>(null)
  const [choix, setChoix] = useState<{ joueur: string; chemin: Point[]; x: number; y: number } | null>(null)
  const [menu, setMenu] = useState<{ cible: Cible | 'miroir'; x: number; y: number } | null>(null)
  const [couleur, setCouleur] = useState<string | null>(null)
  const [lecture, setLecture] = useState<'continue' | 'pas' | null>(null)
  const [anime, setAnime] = useState<ReturnType<typeof etatAnime> | null>(null)
  const [vitesse, setVitesse] = useState(1)
  const [reglage, setReglage] = useState(false)
  const [message, montrer] = useMessage()
  const svg = useRef<SVGSVGElement>(null)
  const geste = useRef<Geste | null>(null)
  const minuteur = useRef(0)
  const sauve = useRef(initial)

  // Sauvegarde automatique à chaque modification (y compris annuler / rétablir).
  useEffect(() => {
    if (s === sauve.current) return
    sauve.current = s
    onChange({ ...s, modifieLe: new Date().toISOString() })
  }, [s, onChange])

  const setApercu = (e: Etape | null) => { apercuRef.current = e; setApercuEtat(e) }
  const visible = apercu ?? etape

  // Toute modification d'une étape passe par ici : les étapes suivantes suivent.
  const modifierEtape = (nouvelle: Etape, cle?: string) => {
    setAnime(null)
    h.modifier((sys) => {
      const etapes = [...sys.etapes]
      const avant = etapes[i]
      etapes[i] = nouvelle
      return { ...sys, etapes: propager(etapes, i, avant) }
    }, cle)
  }
  const modifierSysteme = (f: (sys: Systeme) => Systeme) => {
    setAnime(null)
    h.modifier(f)
  }

  const versTerrain = (x: number, y: number): Point => {
    const p = new DOMPoint(x, y).matrixTransform(svg.current!.getScreenCTM()!.inverse())
    return borner(s.terrain, depuisEcran(s.terrain, [p.x, p.y]))
  }

  const fermerTout = () => { setMenu(null); setChoix(null); setTrait(null); setAnime(null) }
  const allerA = (k: number) => { fermerTout(); setSelection(null); setLecture(null); setI(k) }

  // ---------- Gestes sur le terrain ----------
  const surDown = (e: PE<SVGSVGElement>) => {
    if (!e.isPrimary || lecture) return
    fermerTout()
    e.currentTarget.setPointerCapture(e.pointerId)
    const cible = lireCible(e.target)
    const p = versTerrain(e.clientX, e.clientY)
    const dessin = (mode === 'dessiner' || e.pointerType === 'pen') && cible?.type !== 'poignee'
    geste.current = { cible, client: [e.clientX, e.clientY], debut: p, pts: [p], bouge: false, dessin, long: false }
    const appuiLong = cible && (cible.type === 'action' || cible.type === 'texte' || (cible.type === 'joueur' && !dessin))
    if (appuiLong) {
      const [x, y] = [e.clientX, e.clientY]
      minuteur.current = window.setTimeout(() => {
        if (!geste.current) return
        geste.current.long = true
        if (cible.type === 'action') setSelection(cible.id)
        setMenu({ cible, x, y })
      }, 500)
    }
  }

  const surMove = (e: PE<SVGSVGElement>) => {
    const g = geste.current
    if (!g || !e.isPrimary || g.long) return
    if (!g.bouge && Math.hypot(e.clientX - g.client[0], e.clientY - g.client[1]) < 8) return
    g.bouge = true
    clearTimeout(minuteur.current)
    const p = versTerrain(e.clientX, e.clientY)
    if (g.dessin) {
      g.pts.push(p)
      setTrait([...g.pts])
      return
    }
    const c = g.cible
    if (c?.type === 'joueur') setApercu(deplacerJoueur(etape, c.id, p))
    else if (c?.type === 'texte') setApercu({ ...etape, textes: etape.textes.map((t) => (t.id === c.id ? { ...t, x: p[0], y: p[1] } : t)) })
    else if (c?.type === 'poignee' && selection) {
      const a = etape.actions.find((x) => x.id === selection)
      if (a) setApercu(changerChemin(etape, a.id, a.chemin.map((q, k) => (k === +c.id ? p : q))))
    }
  }

  const surUp = (e: PE<SVGSVGElement>) => {
    if (!e.isPrimary) return
    clearTimeout(minuteur.current)
    const g = geste.current
    geste.current = null
    if (!g || g.long) return
    if (g.dessin && g.bouge) return finirTrait(g.pts, e.clientX, e.clientY)
    if (g.bouge) {
      let fin = apercuRef.current
      setApercu(null)
      if (!fin) return
      const a = fin.actions.find((x) => x.id === selection)
      if (g.cible?.type === 'poignee' && a?.type === 'passe' && +g.cible.id === a.chemin.length - 1) {
        const r = receveurPasse(fin, a.joueur, a.chemin)
        if (r) fin = { ...fin, actions: fin.actions.map((x) => (x.id === a.id ? { ...x, ...r } : x)) }
      }
      return modifierEtape(fin)
    }
    toucher(g.cible, g.debut, g.dessin, e.clientX, e.clientY)
  }

  const surCancel = () => {
    clearTimeout(minuteur.current)
    geste.current = null
    setApercu(null)
    setTrait(null)
  }

  const toucher = (c: Cible | null, p: Point, dessin: boolean, x: number, y: number) => {
    // Un joueur touché ouvre ses options : un toucher par erreur ne change plus le ballon.
    if (c?.type === 'joueur') return setMenu({ cible: c, x, y })
    if (c?.type === 'action') return setSelection(c.id === selection ? null : c.id)
    if (c?.type === 'texte') return editerTexte(c.id)
    if (c?.type === 'poignee') return
    if (selection) return setSelection(null)
    if (dessin) return
    if (mode === 'placer') ajouterJoueur('attaque', p)
    else if (mode === 'defense') ajouterJoueur('defense', p)
    else if (mode === 'texte') {
      const texte = prompt('Texte à afficher sur le terrain')?.trim()
      if (texte) modifierEtape({ ...etape, textes: [...etape.textes, { id: nouvelId('t'), x: p[0], y: p[1], texte }] })
    }
  }

  const ajouterJoueur = (camp: Camp, [x, y]: Point) => {
    const pris = etape.joueurs.filter((j) => j.camp === camp).map((j) => j.numero)
    const numero = [1, 2, 3, 4, 5].find((n) => !pris.includes(n))
    if (!numero) return montrer(camp === 'attaque' ? 'Les 5 attaquants sont déjà sur le terrain.' : 'Les 5 défenseurs sont déjà sur le terrain.')
    modifierEtape({ ...etape, joueurs: [...etape.joueurs, { id: nouvelId(camp === 'attaque' ? 'A' : 'D'), camp, numero, x, y }] })
  }

  const editerTexte = (id: string) => {
    const t = etape.textes.find((x) => x.id === id)!
    const texte = prompt('Modifier le texte', t.texte)
    if (texte === null) return
    modifierEtape({ ...etape, textes: texte.trim() ? etape.textes.map((x) => (x.id === id ? { ...x, texte: texte.trim() } : x)) : etape.textes.filter((x) => x.id !== id) })
  }

  const finirTrait = (pts: Point[], x: number, y: number) => {
    setTrait(null)
    const chemin = lisserTrace(pts)
    if (!chemin) return
    const att = attacherTrait(etape, chemin)
    if (!att) return montrer('Commence le trait sur un joueur.')
    setChoix({ ...att, x, y })
  }

  // Crée (ou transforme) une action d'un type donné ; une passe doit finir près d'un coéquipier.
  const avecType = (a: Omit<Action, 'type' | 'vers'>, type: TypeAction): Action | null => {
    if (type !== 'passe') return { ...a, type }
    const r = receveurPasse(etape, a.joueur, a.chemin)
    if (!r) {
      montrer('Termine la passe près d’un coéquipier.')
      return null
    }
    return { ...a, type, ...r }
  }

  const choisirType = (type: TypeAction) => {
    if (!choix) return
    const j = etape.joueurs.find((x) => x.id === choix.joueur)!
    const a = avecType({ id: nouvelId('a'), joueur: choix.joueur, chemin: choix.chemin, couleur: couleur ?? (j.camp === 'defense' ? ROUGE : ENCRE) }, type)
    if (!a) return
    modifierEtape({ ...etape, actions: [...etape.actions, a] })
    setChoix(null)
  }

  const changerAction = (id: string, f: (a: Action) => Action | null) => {
    const a = etape.actions.find((x) => x.id === id)
    const b = a && f(a)
    if (b) modifierEtape({ ...etape, actions: etape.actions.map((x) => (x.id === id ? b : x)) })
  }

  // ---------- Étapes ----------
  const inserer = (nouvelle: Etape) => {
    modifierSysteme((sys) => ({ ...sys, etapes: [...sys.etapes.slice(0, i + 1), nouvelle, ...sys.etapes.slice(i + 1)] }))
    allerA(i + 1)
  }
  const dupliquer = () => inserer({
    ...etape,
    id: nouvelId('e'),
    actions: etape.actions.map((a) => ({ ...a, id: nouvelId('a') })),
    textes: etape.textes.map((t) => ({ ...t, id: nouvelId('t') })),
  })
  const supprimerEtape = () => {
    if (s.etapes.length < 2 || !confirm(`Supprimer l’étape ${i + 1} ?`)) return
    modifierSysteme((sys) => ({ ...sys, etapes: sys.etapes.filter((_, k) => k !== i) }))
    allerA(Math.max(0, i - 1))
  }
  const miroir = (tout: boolean) => {
    setMenu(null)
    if (tout) return modifierSysteme(miroirSysteme)
    // Une seule étape : volontairement sans propagation.
    modifierSysteme((sys) => ({ ...sys, etapes: sys.etapes.map((e, k) => (k === i ? miroirEtape(e, sys.terrain.largeur) : e)) }))
  }

  // ---------- Animation ----------
  useEffect(() => {
    if (!lecture) return
    const e = s.etapes[i]
    const duree = (e.actions.length ? DUREE_TEMPS * nombreTemps(e) : 700) / vitesse
    const t0 = performance.now()
    let raf = 0
    const image = (now: number) => {
      const t = Math.min(1, (now - t0) / duree)
      setAnime(etatAnime(e, t))
      if (t < 1) {
        raf = requestAnimationFrame(image)
        return
      }
      if (i < s.etapes.length - 1) {
        setAnime(null)
        setI(i + 1)
        if (lecture === 'pas') setLecture(null)
      } else setLecture(null) // on reste sur la dernière image
    }
    raf = requestAnimationFrame(image)
    return () => cancelAnimationFrame(raf)
  }, [lecture, i]) // vitesse et système volontairement figés pendant une lecture

  const lire = () => {
    if (lecture) {
      setLecture(null)
      setAnime(null)
      return
    }
    fermerTout()
    setSelection(null)
    if (i === s.etapes.length - 1 && !etape.actions.length && s.etapes.length > 1) setI(0)
    setLecture('continue')
  }

  const contenuMenu = (c: Cible | 'miroir') => {
    if (c === 'miroir') return (
      <>
        <button className="bouton large" onClick={() => miroir(false)}>Retourner cette étape</button>
        <button className="bouton large" onClick={() => miroir(true)}>Retourner tout le système</button>
      </>
    )
    if (c.type === 'action') {
      const a = etape.actions.find((x) => x.id === c.id)
      if (!a) return null
      return (
        <>
          <div className="rangee">
            {TYPES.map(([t, nom]) => (
              <button key={t} className="type" aria-pressed={a.type === t}
                onClick={() => changerAction(a.id, (x) => (x.type === t ? x : avecType({ id: x.id, joueur: x.joueur, chemin: x.chemin, couleur: x.couleur }, t)))}>
                <ApercuType type={t} />{nom}
              </button>
            ))}
          </div>
          <div className="rangee couleurs">
            {COULEURS.map((coul) => (
              <button key={coul} className="couleur" style={{ background: coul }} aria-label="Couleur" aria-pressed={a.couleur === coul}
                onClick={() => { setCouleur(coul); changerAction(a.id, (x) => ({ ...x, couleur: coul })) }} />
            ))}
          </div>
          <button className="bouton large danger" onClick={() => {
            modifierEtape({ ...etape, actions: etape.actions.filter((x) => x.id !== a.id) })
            setSelection(null)
            setMenu(null)
          }}><Icone.corbeille />Supprimer l’action</button>
        </>
      )
    }
    if (c.type === 'joueur') {
      const j = etape.joueurs.find((x) => x.id === c.id)
      if (!j) return null
      const ballon = etape.ballon === j.id
      return (
        <>
          <div className="rangee numeros" role="group" aria-label="Numéro">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="numero" aria-pressed={j.numero === n}
                onClick={() => { modifierSysteme((sys) => changerNumero(sys, j.id, n)); setMenu(null) }}>
                {j.camp === 'defense' ? `X${n}` : n}
              </button>
            ))}
          </div>
          {j.camp === 'attaque' && (
            <button className="bouton large" onClick={() => { modifierEtape({ ...etape, ballon: ballon ? null : j.id }); setMenu(null) }}>
              {ballon ? 'Enlever le ballon' : 'Donner le ballon'}
            </button>
          )}
          <button className="bouton large danger" onClick={() => { modifierEtape(retirerJoueur(etape, j.id)); setMenu(null) }}>
            <Icone.corbeille />Retirer le joueur
          </button>
        </>
      )
    }
    return (
      <>
        <button className="bouton large" onClick={() => { setMenu(null); editerTexte(c.id) }}>Modifier le texte</button>
        <button className="bouton large danger" onClick={() => {
          modifierEtape({ ...etape, textes: etape.textes.filter((x) => x.id !== c.id) })
          setMenu(null)
        }}><Icone.corbeille />Supprimer le texte</button>
      </>
    )
  }

  const vueEntier = s.terrain.vue === 'entier'
  const outils: [Mode, string, () => JSX.Element][] = [
    ['placer', 'Placer', Icone.placer],
    ['dessiner', 'Dessiner', Icone.dessiner],
    ['defense', 'Défenseur', Icone.defenseur],
    ['texte', 'Texte', Icone.texte],
  ]

  return (
    <main className={`editeur${vueEntier ? ' entier' : ''}${lecture ? ' en-lecture' : ''}`}>
      <header className="barre">
        <button className="bouton" onClick={onFermer}><Icone.retour />Mes systèmes</button>
        <button className="titre" onClick={() => {
          const nom = prompt('Nom du système', s.nom)?.trim()
          if (nom) modifierSysteme((sys) => ({ ...sys, nom }))
        }}>{s.nom}</button>
        <div className="groupe">
          <button className="bouton" onClick={() => { fermerTout(); h.annuler() }} disabled={!h.peutAnnuler}><Icone.annuler />Annuler</button>
          <button className="bouton" onClick={() => { fermerTout(); h.retablir() }} disabled={!h.peutRetablir}><Icone.retablir />Rétablir</button>
          <button className="bouton" onClick={(e) => setMenu({ cible: 'miroir', x: e.clientX, y: e.clientY })}><Icone.miroir />Miroir</button>
          <button className="bouton" onClick={() => setReglage(true)}><Icone.terrain />Terrain</button>
        </div>
      </header>

      <nav className="outils" aria-label="Outils">
        {outils.map(([m, nom, Ic]) => (
          <button key={m} className="outil" aria-pressed={mode === m} onClick={() => { setMode(m); setSelection(null) }}><Ic />{nom}</button>
        ))}
        <button className="outil" onClick={() => {
          if (!etape.joueurs.some((j) => j.camp === 'attaque')) return montrer('Place d’abord les attaquants.')
          modifierEtape(placerDefense(etape, s.terrain))
        }}><Icone.defense5 />5 défenseurs</button>
      </nav>

      <div className="zone-terrain">
        <p className="aide">{{
          placer: 'Touche le terrain : joueur suivant. Touche un joueur : numéro, ballon. Glisse : déplacer.',
          dessiner: 'Trace une action en partant d’un joueur.',
          defense: 'Touche le terrain pour poser X1 à X5.',
          texte: 'Touche le terrain pour écrire.',
        }[mode]}</p>
        <TerrainSvg ref={svg} terrain={s.terrain} etape={visible} selection={selection} anime={anime}
          trait={choix ? polyligne(choix.chemin) : trait}
          onPointerDown={surDown} onPointerMove={surMove} onPointerUp={surUp} onPointerCancel={surCancel}
          onContextMenu={(e) => e.preventDefault()} />
      </div>

      <aside className="panneau">
        <div className="etapes" role="tablist" aria-label="Étapes">
          {s.etapes.map((e, k) => (
            <button key={e.id} role="tab" aria-selected={k === i} className="pastille" onClick={() => allerA(k)}>{k + 1}</button>
          ))}
          <button className="pastille ajout" onClick={() => inserer(etapeSuivante(etape))} aria-label="Ajouter l’étape suivante"><Icone.plus /></button>
        </div>
        <label className="description">
          Étape {i + 1}
          <textarea value={etape.description} placeholder="Ce qui se passe à cette étape…"
            onChange={(e) => modifierEtape({ ...etape, description: e.target.value }, `description-${etape.id}`)} />
        </label>
        <div className="groupe">
          <button className="bouton" onClick={dupliquer}><Icone.dupliquer />Dupliquer</button>
          <button className="bouton" onClick={supprimerEtape} disabled={s.etapes.length < 2}><Icone.corbeille />Supprimer</button>
        </div>
        <div className="lecture">
          <button className="bouton rond" onClick={() => allerA(i - 1)} disabled={i === 0 || !!lecture} aria-label="Étape précédente"><Icone.precedent /></button>
          <button className="bouton principal" onClick={lire}>{lecture ? <><Icone.stop />Arrêter</> : <><Icone.lire />Lire</>}</button>
          <button className="bouton rond" onClick={() => { fermerTout(); setSelection(null); setLecture('pas') }} disabled={!!lecture} aria-label="Jouer cette étape"><Icone.suivant /></button>
        </div>
        <label className="vitesse">
          Vitesse ×{vitesse.toLocaleString('fr-FR')}
          <input type="range" min={0.5} max={2} step={0.25} value={vitesse} onChange={(e) => setVitesse(e.target.valueAsNumber)} />
        </label>
      </aside>

      {choix && (
        <div className="bulle" style={pres(choix.x, choix.y, 420, 110)} role="dialog" aria-label="Type d’action">
          {TYPES.map(([t, nom]) => (
            <button key={t} className="type" onClick={() => choisirType(t)}><ApercuType type={t} />{nom}</button>
          ))}
          <button className="type annuler" onClick={() => setChoix(null)} aria-label="Annuler le trait"><Icone.corbeille /></button>
        </div>
      )}

      {menu && (
        <div className="voile transparent" onPointerDown={(e) => e.target === e.currentTarget && setMenu(null)}>
          <div className="bulle menu" style={pres(menu.x, menu.y)} role="dialog">{contenuMenu(menu.cible)}</div>
        </div>
      )}

      {reglage && (
        <ReglageTerrain titre="Terrain" bouton="Appliquer" terrain={s.terrain} onAnnuler={() => setReglage(false)}
          onValider={(_, t) => { setReglage(false); retenirTerrain(t); modifierSysteme((sys) => ({ ...sys, terrain: t })) }} />
      )}
      <Message texte={message} />
    </main>
  )
}
