import { useRef, useState } from 'react'
import { exporter, importer } from '../modele/fichier.ts'
import type { Systeme, Terrain } from '../modele/types.ts'
import { dernierTerrain, partagerFichier } from '../stockage.ts'
import { Icone } from './Icones.tsx'
import { Message, useMessage } from './Message.tsx'
import { ReglageTerrain } from './ReglageTerrain.tsx'
import { TerrainSvg } from './Terrain.tsx'

interface Props {
  systemes: Systeme[] | null
  onOuvrir(id: string): void
  onCreer(nom: string, t: Terrain): void
  onEnregistrer(s: Systeme): void
  onSupprimer(id: string): void
}

const nomFichier = (nom: string) =>
  nom.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'systeme'

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export function Liste({ systemes, onOuvrir, onCreer, onEnregistrer, onSupprimer }: Props) {
  const [creation, setCreation] = useState(false)
  const [menuDe, setMenuDe] = useState<Systeme | null>(null)
  const [message, montrer] = useMessage()
  const fichier = useRef<HTMLInputElement>(null)
  const tries = [...(systemes ?? [])].sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))

  const importerFichier = async (f: File | undefined) => {
    if (!f) return
    try {
      const { nouveaux, dejaPresents } = importer(await f.text(), systemes ?? [])
      nouveaux.forEach(onEnregistrer)
      if (!nouveaux.length) montrer(dejaPresents ? 'Ces systèmes sont déjà sur cet iPad.' : 'Ce fichier ne contient aucun système.')
      else montrer(`${pluriel(nouveaux.length, 'système')} importé${nouveaux.length > 1 ? 's' : ''}${dejaPresents ? `, ${dejaPresents} déjà présent${dejaPresents > 1 ? 's' : ''}` : ''}.`)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      if (fichier.current) fichier.current.value = ''
    }
  }

  const toutSauvegarder = () => {
    if (!tries.length) return montrer('Rien à sauvegarder pour l’instant.')
    partagerFichier(`triple-threat-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`, exporter(tries))
  }

  return (
    <main className="liste">
      <header className="entete">
        <h1><img src={`${import.meta.env.BASE_URL}icone.svg`} alt="" />Triple Threat</h1>
        <div className="actions-entete">
          <button className="bouton" onClick={() => fichier.current?.click()}><Icone.importer />Importer</button>
          <button className="bouton" onClick={toutSauvegarder}><Icone.partager />Tout sauvegarder</button>
          <input ref={fichier} type="file" accept="application/json,.json" hidden onChange={(e) => importerFichier(e.target.files?.[0])} />
        </div>
      </header>

      <ul className="grille">
        <li>
          <button className="carte nouvelle" onClick={() => setCreation(true)}>
            <Icone.plus />
            Nouveau système
          </button>
        </li>
        {tries.map((s) => (
          <li key={s.id} className="carte">
            <button className="vignette" onClick={() => onOuvrir(s.id)} aria-label={`Ouvrir ${s.nom}`}>
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

      {systemes && !systemes.length && (
        <p className="vide">Aucun système pour l’instant. Crée le premier, ou importe une sauvegarde.</p>
      )}
      <p className="conseil">
        Tes systèmes restent sur cet iPad. Safari peut effacer les données d’une appli peu utilisée :
        fais « Tout sauvegarder » de temps en temps et range le fichier dans Fichiers ou iCloud.
      </p>

      {creation && (
        <ReglageTerrain titre="Nouveau système" bouton="Créer" nom="" terrain={dernierTerrain()}
          onAnnuler={() => setCreation(false)}
          onValider={(nom, t) => { setCreation(false); onCreer(nom, t) }} />
      )}

      {menuDe && (
        <div className="voile" onPointerDown={(e) => e.target === e.currentTarget && setMenuDe(null)}>
          <div className="fenetre petite" role="dialog" aria-label={menuDe.nom}>
            <h2>{menuDe.nom}</h2>
            <button className="bouton large" onClick={() => {
              const nom = prompt('Nouveau nom du système', menuDe.nom)?.trim()
              if (nom) onEnregistrer({ ...menuDe, nom, modifieLe: new Date().toISOString() })
              setMenuDe(null)
            }}>Renommer</button>
            <button className="bouton large" onClick={() => { partagerFichier(`${nomFichier(menuDe.nom)}.json`, exporter([menuDe])); setMenuDe(null) }}>
              <Icone.partager />Exporter ce système
            </button>
            <button className="bouton large danger" onClick={() => {
              if (confirm(`Supprimer « ${menuDe.nom} » ? Cette action est définitive.`)) onSupprimer(menuDe.id)
              setMenuDe(null)
            }}><Icone.corbeille />Supprimer</button>
            <button className="bouton large" onClick={() => setMenuDe(null)}>Fermer</button>
          </div>
        </div>
      )}
      <Message texte={message} />
    </main>
  )
}
