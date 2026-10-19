import { useRegisterSW } from 'virtual:pwa-register/react'

// Ne bloque jamais : le coach peut ignorer et continuer hors ligne.
export function MiseAJour() {
  const {
    needRefresh: [besoin, setBesoin],
    updateServiceWorker,
  } = useRegisterSW()
  if (!besoin) return null
  return (
    <div className="bandeau" role="status">
      <span>Nouvelle version disponible</span>
      <button className="bouton principal" onClick={() => updateServiceWorker(true)}>Mettre à jour</button>
      <button className="bouton" onClick={() => setBesoin(false)}>Plus tard</button>
    </div>
  )
}
