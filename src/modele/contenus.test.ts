// Les paquets de public/contenus/ (générés par npm run contenus) doivent s'importer sans erreur ni doublon.
import { describe, expect, it } from 'vitest'
import { importer, type Contenu } from './fichier.ts'

const fichiers = import.meta.glob<string>('../../public/contenus/*.json', { query: '?raw', import: 'default', eager: true })
const lire = (nom: string) => fichiers[`../../public/contenus/${nom}`]
const index: { id: string }[] = JSON.parse(lire('index.json'))
const vide: Contenu = { systemes: [], seances: [], equipes: [], matchs: [] }

describe.each(index)('paquet $id', ({ id }) => {
  const brut = lire(`${id}.json`)
  const r = importer(brut, vide)

  it('s’importe entièrement, séances comprises', () => {
    expect(r.systemes.length).toBe(JSON.parse(brut).systemes.length)
    const ids = new Set(r.systemes.map((s) => s.id))
    for (const s of r.seances) for (const b of s.blocs) expect(ids, `${s.nom} → ${b.document}`).toContain(b.document)
  })

  it('n’ajoute rien la deuxième fois', () => {
    const encore = importer(brut, { ...vide, systemes: r.systemes, seances: r.seances })
    expect(encore.systemes.length + encore.seances.length).toBe(0)
  })

  it('garde joueurs et flèches sur le terrain', () => {
    for (const s of r.systemes) {
      const [maxX, maxY] = [(s.terrain.vue === 'demi' ? s.terrain.longueur / 2 : s.terrain.longueur) + 1.2, s.terrain.largeur + 1.2]
      const dedans = ([x, y]: number[]) => x >= -1.2 && x <= maxX && y >= -1.2 && y <= maxY
      for (const e of s.etapes) {
        for (const j of e.joueurs) expect(dedans([j.x, j.y]), `${s.id} ${j.id}`).toBe(true)
        for (const a of e.actions) for (const p of a.chemin) expect(dedans(p), `${s.id} ${a.id}`).toBe(true)
      }
    }
  })
})
