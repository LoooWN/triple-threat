import { useRef, useState, type PointerEvent as PE } from 'react'
import type { Point, Terrain } from '../modele/types.ts'
import { chemin2d } from './dessinActions.ts'
import { cadre } from './vue.ts'

const COULEURS: [string, string][] = [['#b8322a', 'Rouge'], ['#1b2430', 'Noir'], ['#1f5fa8', 'Bleu'], ['#2e7d4f', 'Vert']]
const EPAISSEURS: [number, string][] = [[0.08, 'Fin'], [0.16, 'Moyen'], [0.32, 'Épais']]

interface Trait { couleur: string; epaisseur: number; points: Point[] }

// Calque posé exactement sur le terrain (même cadre, même viewBox) : rien n'est enregistré, tout disparaît en fermant.
export function TableauBlanc({ terrain, onFermer }: { terrain: Terrain; onFermer(): void }) {
  const [traits, setTraits] = useState<Trait[]>([])
  const [couleur, setCouleur] = useState(COULEURS[0][0])
  const [epaisseur, setEpaisseur] = useState(EPAISSEURS[1][0])
  const svg = useRef<SVGSVGElement>(null)
  const enCours = useRef(false)
  const { largeur, hauteur } = cadre(terrain)

  const point = (e: PE): Point => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current!.getScreenCTM()!.inverse())
    return [p.x, p.y]
  }
  const finir = () => { enCours.current = false }

  return (
    <div className="tableau-blanc">
      <svg ref={svg} viewBox={`0 0 ${largeur} ${hauteur}`} className="calque" aria-label="Tableau blanc"
        onPointerDown={(e) => {
          if (!e.isPrimary) return
          e.currentTarget.setPointerCapture(e.pointerId)
          enCours.current = true
          setTraits((t) => [...t, { couleur, epaisseur, points: [point(e)] }])
        }}
        onPointerMove={(e) => {
          if (!enCours.current || !e.isPrimary) return
          const p = point(e)
          setTraits((t) => [...t.slice(0, -1), { ...t[t.length - 1], points: [...t[t.length - 1].points, p] }])
        }}
        onPointerUp={finir} onPointerCancel={finir} onContextMenu={(e) => e.preventDefault()}>
        {traits.map((t, k) => (
          <path key={k} d={chemin2d(t.points.length > 1 ? t.points : [t.points[0], t.points[0]])} stroke={t.couleur} strokeWidth={t.epaisseur} />
        ))}
      </svg>
      <div className="outils-tableau" role="toolbar" aria-label="Outils du tableau blanc">
        {COULEURS.map(([c, nom]) => (
          <button key={c} className="couleur" style={{ background: c }} aria-label={nom} aria-pressed={couleur === c} onClick={() => setCouleur(c)} />
        ))}
        <span className="separateur" />
        {EPAISSEURS.map(([ep, nom]) => (
          <button key={nom} className="epaisseur" aria-label={nom} aria-pressed={epaisseur === ep} onClick={() => setEpaisseur(ep)}>
            <span style={{ height: ep * 40 }} />
          </button>
        ))}
        <span className="separateur" />
        <button className="bouton" onClick={() => setTraits([])} disabled={!traits.length}>Effacer tout</button>
        <button className="bouton principal" onClick={onFermer}>Fermer</button>
      </div>
    </div>
  )
}
