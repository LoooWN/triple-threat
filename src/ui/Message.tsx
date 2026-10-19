import { useCallback, useRef, useState } from 'react'

export function useMessage(): [string | null, (texte: string) => void] {
  const [texte, setTexte] = useState<string | null>(null)
  const minuteur = useRef(0)
  const montrer = useCallback((t: string) => {
    setTexte(t)
    clearTimeout(minuteur.current)
    minuteur.current = window.setTimeout(() => setTexte(null), 3000)
  }, [])
  return [texte, montrer]
}

export const Message = ({ texte }: { texte: string | null }) =>
  texte ? <div className="message" role="status">{texte}</div> : null
