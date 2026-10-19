import { useState } from 'react'
import type { Terrain } from '../modele/types.ts'
import { TerrainSvg } from './Terrain.tsx'

interface Props {
  titre: string
  bouton: string
  nom?: string // absent : on ne règle que le terrain
  terrain: Terrain
  onValider(nom: string, t: Terrain): void
  onAnnuler(): void
}

function Choix<T>({ libelle, valeur, options, onChange }: { libelle: string; valeur: T; options: [T, string][]; onChange(v: T): void }) {
  return (
    <fieldset className="choix">
      <legend>{libelle}</legend>
      <div className="segments">
        {options.map(([v, texte]) => (
          <button type="button" key={texte} aria-pressed={v === valeur} onClick={() => onChange(v)}>{texte}</button>
        ))}
      </div>
    </fieldset>
  )
}

const borne = (v: number, min: number, max: number, defaut: number) => (Number.isFinite(v) && v > 0 ? Math.min(max, Math.max(min, v)) : defaut)
const VIDE = { id: 'apercu', description: '', joueurs: [], ballon: null, actions: [], textes: [] }

export function ReglageTerrain({ titre, bouton, nom: nomInitial, terrain, onValider, onAnnuler }: Props) {
  const [nom, setNom] = useState(nomInitial ?? '')
  const [t, setT] = useState(terrain)
  const maj = (p: Partial<Terrain>) => setT((x) => ({ ...x, ...p }))
  const valide: Terrain = { ...t, longueur: borne(t.longueur, 12, 40, 28), largeur: borne(t.largeur, 8, 25, 15) }
  const categorie = t.longueur === 28 && t.largeur === 15 ? (t.ligne3pts === 6.75 ? 'standard' : t.ligne3pts === null ? 'mini' : null) : null

  return (
    <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && onAnnuler()}>
      <form className="fenetre reglage" onSubmit={(e) => { e.preventDefault(); onValider(nom.trim() || 'Sans nom', valide) }}>
        <div className="champs">
          <h2>{titre}</h2>
          {nomInitial !== undefined && (
            <label className="champ">
              Nom
              <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. : Corne, sortie de 1" autoFocus />
            </label>
          )}
          <Choix libelle="Catégorie" valeur={categorie} onChange={(c) => maj({ longueur: 28, largeur: 15, ligne3pts: c === 'standard' ? 6.75 : null })}
            options={[['standard', 'U13 à seniors'], ['mini', 'Mini-basket (U7 à U11)']]} />
          <Choix libelle="Ligne à 3 points" valeur={t.ligne3pts} onChange={(v) => maj({ ligne3pts: v })}
            options={[[6.75, '6,75 m'], [6.25, '6,25 m'], [null, 'Aucune']]} />
          <fieldset className="choix">
            <legend>Dimensions (petit gymnase, terrain en travers…)</legend>
            <div className="dimensions">
              <label>Longueur <input type="number" inputMode="decimal" step={0.5} min={12} max={40} value={Number.isNaN(t.longueur) ? '' : t.longueur} onChange={(e) => maj({ longueur: e.target.valueAsNumber })} /> m</label>
              <label>Largeur <input type="number" inputMode="decimal" step={0.5} min={8} max={25} value={Number.isNaN(t.largeur) ? '' : t.largeur} onChange={(e) => maj({ largeur: e.target.valueAsNumber })} /> m</label>
            </div>
          </fieldset>
          <Choix<Terrain['vue']> libelle="Affichage" valeur={t.vue} onChange={(v) => maj({ vue: v })}
            options={[['demi', 'Demi-terrain'], ['entier', 'Terrain entier']]} />
        </div>
        <div className="colonne-apercu">
          <TerrainSvg terrain={valide} etape={VIDE} aria-label="Aperçu du terrain" />
          <div className="boutons">
            <button type="button" className="bouton" onClick={onAnnuler}>Annuler</button>
            <button className="bouton principal">{bouton}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
