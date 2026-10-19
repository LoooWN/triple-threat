import { nouvelId, type Systeme } from './types.ts'

const FORMAT = 'triple-threat'

export function exporter(systemes: Systeme[]): string {
  return JSON.stringify({ format: FORMAT, version: 1, exporteLe: new Date().toISOString(), systemes }, null, 2)
}

// Le fichier vient de l'extérieur : on vérifie tout avant d'y toucher.
type Obj = Record<string, unknown>
const objet = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const nombre = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const texte = (v: unknown) => typeof v === 'string'
const liste = (v: unknown, ok: (x: unknown) => boolean) => Array.isArray(v) && v.every(ok)
const point = (p: unknown) => Array.isArray(p) && p.length === 2 && nombre(p[0]) && nombre(p[1])

const joueur = (j: unknown) => objet(j) && texte(j.id) && (j.camp === 'attaque' || j.camp === 'defense') && nombre(j.numero) && nombre(j.x) && nombre(j.y)
const action = (a: unknown) =>
  objet(a) && texte(a.id) && ['coupe', 'passe', 'dribble', 'ecran'].includes(a.type as string) && texte(a.joueur) &&
  (a.vers === undefined || texte(a.vers)) && texte(a.couleur) &&
  liste(a.chemin, point) && (a.chemin as unknown[]).length >= 3 && (a.chemin as unknown[]).length % 2 === 1
const etiquette = (t: unknown) => objet(t) && texte(t.id) && nombre(t.x) && nombre(t.y) && texte(t.texte)
const etape = (e: unknown) =>
  objet(e) && texte(e.id) && texte(e.description) && (e.ballon === null || texte(e.ballon)) &&
  liste(e.joueurs, joueur) && liste(e.actions, action) && liste(e.textes, etiquette)
const terrain = (t: unknown) =>
  objet(t) && (t.vue === 'demi' || t.vue === 'entier') && nombre(t.longueur) && nombre(t.largeur) && (t.ligne3pts === null || nombre(t.ligne3pts))
const systeme = (s: unknown) =>
  objet(s) && texte(s.id) && texte(s.nom) && texte(s.creeLe) && texte(s.modifieLe) && terrain(s.terrain) &&
  liste(s.etapes, etape) && (s.etapes as unknown[]).length > 0

export function importer(contenu: string, existants: Systeme[]): { nouveaux: Systeme[]; dejaPresents: number } {
  let data: unknown
  try {
    data = JSON.parse(contenu)
  } catch {
    throw new Error('Ce fichier n’est pas un fichier Triple Threat lisible.')
  }
  if (!objet(data) || data.format !== FORMAT) throw new Error('Ce fichier ne vient pas de Triple Threat.')
  if (data.version !== 1) throw new Error('Ce fichier vient d’une version plus récente de Triple Threat : mets l’appli à jour.')
  if (!liste(data.systemes, systeme)) throw new Error('Ce fichier est abîmé : un système est incomplet. Rien n’a été importé.')

  const parId = new Map(existants.map((s) => [s.id, s]))
  const nouveaux: Systeme[] = []
  let dejaPresents = 0
  for (const s of data.systemes as Systeme[]) {
    const existant = parId.get(s.id)
    if (!existant) nouveaux.push(s)
    else if (existant.modifieLe === s.modifieLe) dejaPresents++
    else nouveaux.push({ ...s, id: nouvelId('s'), nom: `${s.nom} (copie)` })
  }
  return { nouveaux, dejaPresents }
}
