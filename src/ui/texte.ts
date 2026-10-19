export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export const nomFichier = (nom: string) =>
  nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'triple-threat'

export const maintenant = () => new Date().toISOString()

// 45 → « 45 min », 75 → « 1 h 15 », 120 → « 2 h ».
export function formaterDuree(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const [h, m] = [Math.floor(minutes / 60), minutes % 60]
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

// « 2026-10-21 » → « mercredi 21 octobre »
export const dateLongue = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

// Compte à rebours : 75 → « 01:15 », -5 → « 00:00 ».
export const minuteur = (secondes: number) => {
  const s = Math.max(0, secondes)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// Date du jour à l'heure de l'iPad (pas en UTC), au format AAAA-MM-JJ.
export const aujourdhui = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
