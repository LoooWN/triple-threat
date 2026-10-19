export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export const nomFichier = (nom: string) =>
  nom.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'triple-threat'

export const maintenant = () => new Date().toISOString()
