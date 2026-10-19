import { useId, type ComponentProps } from 'react'
import { PANIER_X } from '../modele/defense.ts'
import type { Action, Etape, Materiel, Point, Terrain } from '../modele/types.ts'
import { chemin2d, traceAction } from './dessinActions.ts'
import { cadre, matrice, versEcran } from './vue.ts'

interface Props extends ComponentProps<'svg'> {
  terrain: Terrain
  etape: Etape
  selection?: string | null
  trait?: Point[] | null
  anime?: { positions: Map<string, Point>; ballons: Point[] } | null
  maillots?: Record<string, { maillot: string; nom: string }> // id du pion → joueur de l'équipe
  materiel?: Materiel[]
}

export function TerrainSvg({ terrain, etape, selection, trait, anime, maillots = {}, materiel = [], ...svg }: Props) {
  const { largeur, hauteur } = cadre(terrain)
  const E = (p: Point) => versEcran(terrain, p)
  const position = (id: string, x: number, y: number) => E(anime?.positions.get(id) ?? [x, y])
  const ballons = anime
    ? anime.ballons.map(E)
    : etape.joueurs.filter((j) => etape.ballons.includes(j.id)).map((j) => position(j.id, j.x, j.y))
  const choisie = !anime && etape.actions.find((a) => a.id === selection)

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="terrain" {...svg}>
      <rect width={largeur} height={hauteur} className="abords" />
      <Lignes terrain={terrain} />
      {materiel.map((m) => <MaterielSvg key={m.id} m={m} terrain={terrain} />)}
      <g className={anime ? 'actions estompees' : 'actions'}>
        {etape.actions.map((a) => <ActionSvg key={a.id} a={a} terrain={terrain} choisie={a.id === selection} />)}
      </g>
      {trait && trait.length > 1 && <path d={chemin2d(trait.map(E))} className="trait" />}
      {etape.textes.map((t) => {
        const [x, y] = E([t.x, t.y])
        return <text key={t.id} data-texte={t.id} x={x} y={y} className="etiquette">{t.texte}</text>
      })}
      {etape.joueurs.map((j) => {
        const [x, y] = position(j.id, j.x, j.y)
        const m = maillots[j.id]
        const texte = m ? m.maillot : j.camp === 'coach' ? 'C' : j.camp === 'defense' ? `X${j.numero}` : j.numero
        return (
          <g key={j.id} data-joueur={j.id} className={`joueur ${j.camp}${m ? ' maillot' : ''}`} transform={`translate(${x} ${y})`}>
            <circle r={0.6} className="zone" />
            <circle r={0.42} className="pion" />
            <text dominantBaseline="central">{texte}</text>
            {m?.nom && <text y={0.78} className="nom">{m.nom}</text>}
          </g>
        )
      })}
      {ballons.map((b, k) => (
        <g key={k} className="ballon" transform={`translate(${b[0] + 0.36} ${b[1] - 0.36})`}>
          <circle r={0.2} />
          <path d="M-0.2 0 H0.2 M0 -0.2 V0.2" />
        </g>
      ))}
      {choisie && <Poignees a={choisie} terrain={terrain} />}
    </svg>
  )
}

// Plot, ballon au sol, ou échelle de rythme (3 m × 0,5 m, barreaux tous les 0,5 m) orientée par `angle`.
function MaterielSvg({ m, terrain }: { m: Materiel; terrain: Terrain }) {
  const [x, y] = versEcran(terrain, [m.x, m.y])
  if (m.type !== 'echelle') return (
    <g data-materiel={m.id} className={`materiel ${m.type}`} transform={`translate(${x} ${y})`}>
      <circle r={0.6} className="zone" />
      {m.type === 'plot' ? <><circle r={0.24} className="base" /><circle r={0.1} className="sommet" /></> : <><circle r={0.2} /><path d="M-0.2 0 H0.2 M0 -0.2 V0.2" /></>}
    </g>
  )
  const a = (m.angle * Math.PI) / 180
  const [b1, b2] = [-1.5, 1.5].map((k) => versEcran(terrain, [m.x + Math.cos(a) * k, m.y + Math.sin(a) * k]))
  const [ux, uy] = [(b2[0] - b1[0]) / 3, (b2[1] - b1[1]) / 3]
  const [nx, ny] = [-uy * 0.25, ux * 0.25]
  const barreaux = Array.from({ length: 7 }, (_, k) => [b1[0] + ux * k * 0.5, b1[1] + uy * k * 0.5])
  return (
    <g data-materiel={m.id} className="materiel echelle">
      <path d={chemin2d([b1, b2])} className="zone" />
      <path d={`${chemin2d([[b1[0] + nx, b1[1] + ny], [b2[0] + nx, b2[1] + ny]])} ${chemin2d([[b1[0] - nx, b1[1] - ny], [b2[0] - nx, b2[1] - ny]])}`} />
      {barreaux.map(([px, py], k) => <path key={k} d={chemin2d([[px + nx, py + ny], [px - nx, py - ny]])} />)}
    </g>
  )
}

function ActionSvg({ a, terrain, choisie }: { a: Action; terrain: Terrain; choisie: boolean }) {
  const t = traceAction(a, terrain)
  return (
    <g data-action={a.id} className={`action ${a.type}${choisie ? ' choisie' : ''}`} style={{ color: a.couleur }}>
      <path d={t.zone} className="zone" />
      <path d={t.ligne} className="ligne" />
      {t.tete && <path d={t.tete} className="tete" />}
      {t.barre && <path d={t.barre} className="barre" />}
    </g>
  )
}

function Poignees({ a, terrain }: { a: Action; terrain: Terrain }) {
  const pts = a.chemin.map((p) => versEcran(terrain, p))
  return (
    <g className="poignees">
      {pts.map((p, k) => k % 2 === 1 && <path key={`g${k}`} d={chemin2d([pts[k - 1], p, pts[k + 1]])} className="guide" />)}
      {pts.map((p, k) => (
        <g key={k} data-poignee={k} transform={`translate(${p[0]} ${p[1]})`}>
          <circle r={0.75} className="zone" />
          <circle r={0.24} className={k % 2 ? 'courbure' : 'ancre'} />
        </g>
      ))}
    </g>
  )
}

// Tracé FIBA : raquette 4,90 × 5,80, cercles de 1,80, zone de non-charge 1,25, panier à 1,575 de la ligne de fond.
function Lignes({ terrain: t }: { terrain: Terrain }) {
  const id = useId()
  const { longueur: L, largeur: W, ligne3pts: R } = t
  const c = W / 2
  const coin = R ? Math.min(R, c - 0.9) : 0
  const bout = (
    <>
      <rect x={0} y={c - 2.45} width={5.8} height={4.9} className="raquette" />
      <path d={`M5.8 ${c - 1.8} A1.8 1.8 0 0 1 5.8 ${c + 1.8}`} />
      <path d={`M5.8 ${c + 1.8} A1.8 1.8 0 0 1 5.8 ${c - 1.8}`} strokeDasharray="0.3 0.25" />
      <path d={`M1.2 ${c - 1.25} H${PANIER_X} A1.25 1.25 0 0 1 ${PANIER_X} ${c + 1.25} H1.2`} />
      {R && coin > 0 && (
        <path d={`M0 ${c - coin} H${PANIER_X + Math.sqrt(R * R - coin * coin)} A${R} ${R} 0 0 1 ${PANIER_X + Math.sqrt(R * R - coin * coin)} ${c + coin} H0`} />
      )}
      <line x1={1.2} y1={c - 0.9} x2={1.2} y2={c + 0.9} className="planche" />
      <circle cx={PANIER_X} cy={c} r={0.225} className="cercle" />
    </>
  )
  return (
    <g transform={matrice(t)}>
      <clipPath id={id}>
        <rect x={-0.05} y={-0.05} width={(t.vue === 'demi' ? L / 2 : L) + 0.1} height={W + 0.1} />
      </clipPath>
      <g clipPath={`url(#${id})`} className="lignes">
        <rect width={L} height={W} className="parquet" />
        {bout}
        {t.vue === 'entier' && <g transform={`translate(${L} 0) scale(-1 1)`}>{bout}</g>}
        <line x1={L / 2} y1={0} x2={L / 2} y2={W} />
        <circle cx={L / 2} cy={c} r={1.8} />
        <rect width={L} height={W} className="contour" />
      </g>
    </g>
  )
}
