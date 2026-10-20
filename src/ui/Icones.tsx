import type { TypeAction } from '../modele/types.ts'

// Icônes dessinées à la main (aucune ressource externe).
const I = ({ d, plein }: { d: string; plein?: boolean }) => (
  <svg viewBox="0 0 24 24" className="icone" aria-hidden="true" fill={plein ? 'currentColor' : 'none'}
    stroke={plein ? 'none' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export const Icone = {
  placer: () => <I d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1.5v-2a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v1m0 0a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.2L4.3 15.6a1.6 1.6 0 0 1 2.4-2.1L8 15" />,
  dessiner: () => <I d="M4 20c3-1 4-4 7-4s3 3 6 2M15 4l4 4-8 8H7v-4l8-8z" />,
  defenseur: () => <I d="M7 7l10 10M17 7L7 17" />,
  defense5: () => <I d="M3 6l5 5M8 6l-5 5M16 6l5 5M21 6l-5 5M9.5 14l5 5M14.5 14l-5 5" />,
  texte: () => <I d="M5 6V4h14v2M12 4v16M9 20h6" />,
  annuler: () => <I d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  retablir: () => <I d="M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  miroir: () => <I d="M12 3v18M8 7L3 12l5 5V7zM16 7l5 5-5 5V7z" />,
  terrain: () => <I d="M3 5h18v14H3zM12 5v14M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />,
  retour: () => <I d="M15 5l-7 7 7 7" />,
  lire: () => <I d="M7 4.5v15l12-7.5z" plein />,
  stop: () => <I d="M6 6h12v12H6z" plein />,
  suivant: () => <I d="M5 4.5v15l10-7.5zM17 5h2.5v14H17z" plein />,
  precedent: () => <I d="M19 4.5v15L9 12zM4.5 5H7v14H4.5z" plein />,
  plus: () => <I d="M12 5v14M5 12h14" />,
  dupliquer: () => <I d="M8 8h11v11H8zM5 16V5h11" />,
  corbeille: () => <I d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  partager: () => <I d="M12 15V3M7 8l5-5 5 5M5 12v8h14v-8" />,
  importer: () => <I d="M12 3v12M7 10l5 5 5-5M5 15v5h14v-5" />,
  coach: () => <I d="M15 8.5a5.5 5.5 0 1 1-5.2 7.3H3v-5h9.3M15 8.5V5h5v3.5zM10 13.3h.01" />,
  plot: () => <I d="M12 3l5.5 16h-11zM4 20h16M9.7 10h4.6M8.6 13.5h6.8" />,
  tourner: () => <I d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />,
  tableau: () => <I d="M3 4h18v12H3zM12 16v4M8 21l4-1 4 1M7 12l3-3 2 2 4-4" />,
  image: () => <I d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01" />,
  pdf: () => <I d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" />,
  haut: () => <I d="M12 19V5M6 11l6-6 6 6" />,
  bas: () => <I d="M12 5v14M6 13l6 6 6-6" />,
  maillot: () => <I d="M8 3L3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c0 2-1.8 3.2-4 3.2S8 5 8 3z" />,
  plusDe: () => <I d="M7 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM21 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" plein />,
}

// Aperçu du style de trait de chaque type d'action.
export function ApercuType({ type }: { type: TypeAction }) {
  const ligne = {
    coupe: 'M4 12H34',
    passe: 'M4 12H34',
    dribble: 'M4 12q2.5-5 5 0t5 0 5 0 5 0 5 0 5 0',
    ecran: 'M4 12H40',
    tir: 'M4 9H35M4 15H35',
  }[type]
  return (
    <svg viewBox="0 0 48 24" className="apercu-type" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d={ligne} strokeDasharray={type === 'passe' ? '5 4' : undefined} />
      {type === 'ecran' ? <path d="M40 5v14" strokeWidth={3.5} /> : <path d="M34 6l9 6-9 6z" fill="currentColor" stroke="none" />}
    </svg>
  )
}
