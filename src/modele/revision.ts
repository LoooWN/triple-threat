import { estDeplacement, positionsFinales } from './etapes.ts'
import { distance } from './geometrie.ts'
import type { Camp, Point, Resultat, Systeme, TypeAction } from './types.ts'

export type Question =
  | { type: 'quoi'; etape: number; joueur: string; reponse: TypeAction | 'rien' }
  | { type: 'ou'; etape: number; joueur: string; cible: Point }
  | { type: 'qui'; etape: number; joueur: string; reponse: string }

export const TOLERANCE = 1.5 // m

// Le camp révisé : celui qui a le plus d'actions (dans un système défensif, ce sont les X qui bougent).
export function campActif(doc: Systeme): Camp {
  let [attaque, defense] = [0, 0]
  for (const e of doc.etapes) for (const a of e.actions) {
    const camp = e.joueurs.find((j) => j.id === a.joueur)?.camp
    if (camp === 'attaque') attaque++
    else if (camp === 'defense') defense++
  }
  return defense > attaque ? 'defense' : 'attaque'
}

export const postes = (doc: Systeme) => {
  const camp = campActif(doc)
  return [...new Set(doc.etapes.flatMap((e) => e.joueurs.filter((j) => j.camp === camp).map((j) => j.numero)))].sort((a, b) => a - b)
}

// Poste choisi : toutes ses étapes (« ne bouge pas » compris). Tous les postes (null) : chaque joueur qui agit.
export function questionsPour(doc: Systeme, poste: number | null): Question[] {
  const camp = campActif(doc)
  return doc.etapes.flatMap((e, etape) => {
    const finales = positionsFinales(e)
    return e.joueurs
      .filter((j) => j.camp === camp && (poste === null || j.numero === poste))
      .sort((a, b) => a.numero - b.numero)
      .flatMap((j): Question[] => {
        const actions = e.actions.filter((a) => a.joueur === j.id)
        if (!actions.length) return poste === null ? [] : [{ type: 'quoi', etape, joueur: j.id, reponse: 'rien' }]
        const qs: Question[] = [{ type: 'quoi', etape, joueur: j.id, reponse: actions[0].type }]
        if (actions.some(estDeplacement)) qs.push({ type: 'ou', etape, joueur: j.id, cible: finales.get(j.id)! })
        const passe = actions.find((a) => a.type === 'passe' && a.vers)
        if (passe) qs.push({ type: 'qui', etape, joueur: j.id, reponse: passe.vers! })
        return qs
      })
  })
}

export function verifier(q: Question, reponse: string | Point): boolean {
  return q.type === 'ou' ? distance(q.cible, reponse as Point) <= TOLERANCE : q.reponse === reponse
}

export const SEUIL = 0.8

export const dernierResultat = (resultats: Resultat[], document: string): Resultat | undefined =>
  resultats.filter((r) => r.document === document).sort((a, b) => b.date.localeCompare(a.date))[0]

// À retravailler : jamais révisé, ou dernier score sous 80 %.
export const aRetravailler = (r: Resultat | undefined) => !r || r.bonnes < SEUIL * r.total
