// Écrit les paquets de contenus tout faits dans public/contenus/ (npm run contenus).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dp } from './dp.ts'
import type { Paquet } from './dsl.ts'
import { fiba } from './fiba.ts'
import { mit } from './mit.ts'
import { sporteasy } from './sporteasy.ts'

const paquets: Paquet[] = [fiba, mit, dp, sporteasy]
const dossier = new URL('../../public/contenus/', import.meta.url)
mkdirSync(dossier, { recursive: true })

for (const { id, titre, description, credits, licence, systemes, seances } of paquets) {
  const json = { format: 'triple-threat', version: 2, titre, description, credits, licence, systemes, seances, equipes: [], matchs: [] }
  writeFileSync(new URL(`${id}.json`, dossier), JSON.stringify(json))
}
const index = paquets.map(({ id, titre, description, credits, systemes, seances }) => ({
  id, titre, description, credits,
  exercices: systemes.filter((s) => s.genre === 'exercice').length,
  systemes: systemes.filter((s) => s.genre === 'systeme').length,
  seances: seances.length,
}))
writeFileSync(new URL('index.json', dossier), JSON.stringify(index, null, 2))
// Vitest garde en cache la liste des fichiers du test des paquets : un nouveau paquet n'y serait pas vu.
rmSync(new URL('../../node_modules/.vitest-cache', import.meta.url), { recursive: true, force: true })
console.log(index.map((p) => `${p.id} : ${p.exercices} exercices, ${p.systemes} systèmes, ${p.seances} séances`).join('\n'))
