import { normaliser } from './documents.ts'
import { nouvelId, type Equipe, type Match, type Seance, type Systeme } from './types.ts'

const FORMAT = 'triple-threat'
const VERSION = 2

export interface Contenu { systemes: Systeme[]; seances: Seance[]; equipes: Equipe[]; matchs: Match[] }

export function exporter({ systemes, seances = [], equipes = [], matchs = [] }: Partial<Contenu> & Pick<Contenu, 'systemes'>): string {
  return JSON.stringify({ format: FORMAT, version: VERSION, exporteLe: new Date().toISOString(), systemes, seances, equipes, matchs }, null, 2)
}

// Le fichier vient de l'extérieur : on vérifie tout avant d'y toucher.
type Obj = Record<string, unknown>
const objet = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const nombre = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const texte = (v: unknown) => typeof v === 'string'
const liste = (v: unknown, ok: (x: unknown) => boolean) => Array.isArray(v) && v.every(ok)
const point = (p: unknown) => Array.isArray(p) && p.length === 2 && nombre(p[0]) && nombre(p[1])
const parmi = (v: unknown, valeurs: string[]) => valeurs.includes(v as string)

const joueur = (j: unknown) => objet(j) && texte(j.id) && parmi(j.camp, ['attaque', 'defense', 'coach']) && nombre(j.numero) && nombre(j.x) && nombre(j.y)
const action = (a: unknown) =>
  objet(a) && texte(a.id) && parmi(a.type, ['coupe', 'passe', 'dribble', 'ecran']) && texte(a.joueur) &&
  (a.vers === undefined || texte(a.vers)) && texte(a.couleur) &&
  liste(a.chemin, point) && (a.chemin as unknown[]).length >= 3 && (a.chemin as unknown[]).length % 2 === 1
const etiquette = (t: unknown) => objet(t) && texte(t.id) && nombre(t.x) && nombre(t.y) && texte(t.texte)
const etape = (e: unknown) =>
  objet(e) && texte(e.id) && texte(e.description) && liste(e.ballons, texte) &&
  liste(e.joueurs, joueur) && liste(e.actions, action) && liste(e.textes, etiquette)
const terrain = (t: unknown) =>
  objet(t) && parmi(t.vue, ['demi', 'entier']) && nombre(t.longueur) && nombre(t.largeur) && (t.ligne3pts === null || nombre(t.ligne3pts))
const materiel = (m: unknown) => objet(m) && texte(m.id) && parmi(m.type, ['plot', 'echelle', 'ballon']) && nombre(m.x) && nombre(m.y) && nombre(m.angle)
export const validerSysteme = (s: unknown) =>
  objet(s) && texte(s.id) && texte(s.nom) && parmi(s.genre, ['systeme', 'exercice']) && texte(s.categorie) &&
  texte(s.creeLe) && texte(s.modifieLe) && terrain(s.terrain) && liste(s.etapes, etape) && (s.etapes as unknown[]).length > 0 &&
  (s.equipe === null || texte(s.equipe)) && objet(s.maillots) && Object.values(s.maillots).every(texte) &&
  liste(s.materiel, materiel) && texte(s.miseEnPlace) && texte(s.pointsCles) && texte(s.variantes) && nombre(s.dureeConseillee)
const bloc = (b: unknown) => objet(b) && texte(b.id) && texte(b.document) && nombre(b.duree) && texte(b.note)
const seance = (s: unknown) => objet(s) && texte(s.id) && texte(s.nom) && texte(s.date) && texte(s.creeLe) && texte(s.modifieLe) && liste(s.blocs, bloc)
const joueurEffectif = (j: unknown) => objet(j) && texte(j.id) && texte(j.nom) && texte(j.maillot)
const equipe = (e: unknown) => objet(e) && texte(e.id) && texte(e.nom) && texte(e.modifieLe) && liste(e.joueurs, joueurEffectif)
const STATS = ['tir2', 'tir2rate', 'tir3', 'tir3rate', 'lf', 'lfrate', 'rebOff', 'rebDef', 'passe', 'interception', 'contre', 'perte', 'faute']
const evenement = (e: unknown) => objet(e) && texte(e.id) && texte(e.joueur) && parmi(e.stat, STATS) && nombre(e.quart)
const adverse = (a: unknown) => objet(a) && texte(a.id) && nombre(a.quart) && nombre(a.points)
const match = (m: unknown) =>
  objet(m) && texte(m.id) && (m.equipe === null || texte(m.equipe)) && texte(m.adversaire) && texte(m.date) && liste(m.presents, texte) &&
  liste(m.evenements, evenement) && liste(m.adverses, adverse) && nombre(m.quart) && texte(m.creeLe) && texte(m.modifieLe)

const ABIME = 'Ce fichier est abîmé : un élément est incomplet. Rien n’a été importé.'

// Déjà présent à l'identique → ignoré ; modifié entre-temps → ajouté en copie, sans rien écraser.
function fusionner<T extends { id: string; modifieLe: string }>(entrants: T[], presents: T[], copie: (x: T) => T) {
  const parId = new Map(presents.map((x) => [x.id, x]))
  const ids = new Map<string, string>()
  let dejaPresents = 0
  const nouveaux = entrants.flatMap((x) => {
    const p = parId.get(x.id)
    if (!p) return [x]
    if (p.modifieLe === x.modifieLe) {
      dejaPresents++
      return []
    }
    ids.set(x.id, nouvelId(x.id.split('-')[0] || 'x'))
    return [{ ...copie(x), id: ids.get(x.id)! }]
  })
  return { nouveaux, ids, dejaPresents }
}

export function importer(contenu: string, existants: Contenu): Contenu & { dejaPresents: number } {
  let data: unknown
  try {
    data = JSON.parse(contenu)
  } catch {
    throw new Error('Ce fichier n’est pas un fichier Triple Threat lisible.')
  }
  if (!objet(data) || data.format !== FORMAT) throw new Error('Ce fichier ne vient pas de Triple Threat.')
  if (nombre(data.version) && (data.version as number) > VERSION) throw new Error('Ce fichier vient d’une version plus récente de Triple Threat : mets l’appli à jour.')
  if (data.version !== 1 && data.version !== VERSION) throw new Error(ABIME)

  const brut = data.systemes
  if (!Array.isArray(brut) || !brut.every((s) => objet(s) && Array.isArray(s.etapes) && s.etapes.every(objet))) throw new Error(ABIME)
  const systemes = brut.map(normaliser)
  const [seances, equipes, matchs] = [data.seances ?? [], data.equipes ?? [], data.matchs ?? []]
  if (!systemes.every(validerSysteme) || !liste(seances, seance) || !liste(equipes, equipe) || !liste(matchs, match)) throw new Error(ABIME)

  const docs = fusionner(systemes, existants.systemes, (x) => ({ ...x, nom: `${x.nom} (copie)` }))
  const ses = fusionner(seances as Seance[], existants.seances, (x) => ({ ...x, nom: `${x.nom} (copie)` }))
  const mat = fusionner(matchs as Match[], existants.matchs, (x) => ({ ...x, adversaire: `${x.adversaire} (copie)` }))
  const equipesNouvelles = (equipes as Equipe[]).filter((e) => !existants.equipes.some((x) => x.id === e.id))
  return {
    systemes: docs.nouveaux,
    seances: ses.nouveaux.map((s) => ({ ...s, blocs: s.blocs.map((b) => ({ ...b, document: docs.ids.get(b.document) ?? b.document })) })),
    equipes: equipesNouvelles,
    matchs: mat.nouveaux,
    dejaPresents: docs.dejaPresents + ses.dejaPresents + mat.dejaPresents + (equipes as Equipe[]).length - equipesNouvelles.length,
  }
}
