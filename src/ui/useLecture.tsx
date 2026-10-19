import { useEffect, useState } from 'react'
import { etatAnime, nombreTemps } from '../modele/animation.ts'
import type { Etape } from '../modele/types.ts'
import { Icone } from './Icones.tsx'

const DUREE_TEMPS = 1800 // ms par « temps » d'une étape, à vitesse ×1

// Étape affichée + animation (lecture continue ou pas à pas), partagée par l'éditeur et la présentation.
export function useLecture(etapes: Etape[]) {
  const [iBrut, setI] = useState(0)
  const i = Math.min(iBrut, etapes.length - 1)
  const [lecture, setLecture] = useState<'continue' | 'pas' | null>(null)
  const [anime, setAnime] = useState<ReturnType<typeof etatAnime> | null>(null)
  const [vitesse, setVitesse] = useState(1)

  useEffect(() => {
    if (!lecture) return
    const e = etapes[i]
    const duree = (e.actions.length ? DUREE_TEMPS * nombreTemps(e) : 700) / vitesse
    const t0 = performance.now()
    let raf = 0
    const image = (now: number) => {
      const t = Math.min(1, (now - t0) / duree)
      setAnime(etatAnime(e, t))
      if (t < 1) {
        raf = requestAnimationFrame(image)
        return
      }
      if (i < etapes.length - 1) {
        setAnime(null)
        setI(i + 1)
        if (lecture === 'pas') setLecture(null)
      } else setLecture(null) // on reste sur la dernière image
    }
    raf = requestAnimationFrame(image)
    return () => cancelAnimationFrame(raf)
  }, [lecture, i]) // vitesse et étapes volontairement figées pendant une lecture

  return {
    i,
    lecture,
    anime,
    vitesse,
    setVitesse,
    effacer: () => setAnime(null),
    aller: (k: number) => { setLecture(null); setAnime(null); setI(k) },
    jouerEtape: () => { setAnime(null); setLecture('pas') },
    lire: () => {
      setAnime(null)
      if (lecture) return setLecture(null)
      if (i === etapes.length - 1 && !etapes[i].actions.length && etapes.length > 1) setI(0)
      setLecture('continue')
    },
  }
}

export type Lecture = ReturnType<typeof useLecture>

export function CommandesLecture({ l, precedent }: { l: Lecture; precedent(): void }) {
  return (
    <>
      <div className="lecture">
        <button className="bouton rond" onClick={precedent} disabled={l.i === 0 || !!l.lecture} aria-label="Étape précédente"><Icone.precedent /></button>
        <button className="bouton principal" onClick={l.lire}>{l.lecture ? <><Icone.stop />Arrêter</> : <><Icone.lire />Lire</>}</button>
        <button className="bouton rond" onClick={l.jouerEtape} disabled={!!l.lecture} aria-label="Jouer cette étape"><Icone.suivant /></button>
      </div>
      <label className="vitesse">
        Vitesse ×{l.vitesse.toLocaleString('fr-FR')}
        <input type="range" min={0.5} max={2} step={0.25} value={l.vitesse} onChange={(e) => l.setVitesse(e.target.valueAsNumber)} />
      </label>
    </>
  )
}
