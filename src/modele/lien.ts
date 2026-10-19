import { validerSysteme } from './fichier.ts'
import { nouvelId, type Paquet, type Systeme } from './types.ts'

const FORMAT = 'triple-threat-revision'
export const PREFIXE = '#revision='
const ABIME = 'Ce lien de révision est incomplet ou abîmé. Demande au coach de le renvoyer.'

async function transformer(donnees: Uint8Array<ArrayBuffer>, flux: CompressionStream | DecompressionStream) {
  return new Uint8Array(await new Response(new Blob([donnees]).stream().pipeThrough(flux)).arrayBuffer())
}

const versBase64url = (octets: Uint8Array) => {
  let s = ''
  for (const o of octets) s += String.fromCharCode(o)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const depuisBase64url = (t: string) => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

// Les joueuses sont souvent mineures : le lien ne contient ni équipe ni maillots, seulement les numéros de poste.
export const paquetPour = (titre: string, docs: Systeme[]): Paquet => ({
  id: nouvelId('p'),
  titre,
  creeLe: new Date().toISOString(),
  systemes: docs.map((d) => ({ ...d, equipe: null, maillots: {} })),
})

// Les systèmes voyagent dans l'adresse elle-même (après le #, jamais envoyé à un serveur), compressés.
export async function encoderPaquet(p: Paquet): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ format: FORMAT, version: 1, ...p }))
  return versBase64url(await transformer(json, new CompressionStream('deflate-raw')))
}

export async function decoderPaquet(code: string): Promise<Paquet> {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(new TextDecoder().decode(await transformer(depuisBase64url(code), new DecompressionStream('deflate-raw'))))
  } catch {
    throw new Error(ABIME)
  }
  if (data?.format !== FORMAT) throw new Error('Ce lien ne vient pas de Triple Threat.')
  if (data.version !== 1) throw new Error('Ce lien vient d’une version plus récente de Triple Threat : recharge la page.')
  const { id, titre, creeLe, systemes } = data
  if (typeof id !== 'string' || typeof titre !== 'string' || typeof creeLe !== 'string' || !Array.isArray(systemes) || !systemes.every(validerSysteme))
    throw new Error(ABIME)
  return { id, titre, creeLe, systemes }
}
