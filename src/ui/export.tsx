import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { maillotsAffiches } from '../modele/documents.ts'
import type { Equipe, Etape, Systeme } from '../modele/types.ts'
import css from '../styles.css?raw'
import { TerrainSvg } from './Terrain.tsx'
import { formaterDuree } from './texte.ts'
import { cadre } from './vue.ts'

// Le terrain d'une étape en SVG autonome (styles inclus), dessiné hors de l'écran.
export function svgEtape(doc: Systeme, etape: Etape, equipes: Equipe[], largeur: number): string {
  const { largeur: l, hauteur: h } = cadre(doc.terrain)
  const div = document.createElement('div')
  const racine = createRoot(div)
  flushSync(() => racine.render(
    <TerrainSvg terrain={doc.terrain} etape={etape} maillots={maillotsAffiches(doc, equipes)} materiel={doc.materiel}
      xmlns="http://www.w3.org/2000/svg" width={largeur} height={Math.round((largeur * h) / l)} />,
  ))
  const svg = div.innerHTML
  racine.unmount()
  return svg.replace('>', `><style><![CDATA[${css}]]></style>`)
}

export function rasteriser(svg: string): Promise<HTMLCanvasElement> {
  return new Promise((ok, ko) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      ;[c.width, c.height] = [img.naturalWidth, img.naturalHeight]
      c.getContext('2d')!.drawImage(img, 0, 0)
      ok(c)
    }
    img.onerror = () => ko(new Error('Le schéma n’a pas pu être dessiné.'))
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

const enBlob = (c: HTMLCanvasElement, type: string) =>
  new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('Image impossible à créer.'))), type, 0.9))

const sousTitre = (d: Systeme) =>
  d.genre === 'exercice' ? `Exercice, ${d.categorie}, ${formaterDuree(d.dureeConseillee)}` : `Système, ${d.categorie}`

const fiche = (d: Systeme) =>
  ([['Mise en place', d.miseEnPlace], ['Points clés', d.pointsCles], ['Variantes', d.variantes]] as const).filter(([, t]) => t.trim())

// Découpe un texte en lignes qui tiennent dans la largeur donnée.
function lignes(mesurer: (t: string) => number, texte: string, largeur: number): string[] {
  return texte.split('\n').flatMap((paragraphe) => {
    const res: string[] = []
    let ligne = ''
    for (const mot of paragraphe.split(/\s+/).filter(Boolean)) {
      const essai = ligne ? `${ligne} ${mot}` : mot
      if (ligne && mesurer(essai) > largeur) {
        res.push(ligne)
        ligne = mot
      } else ligne = essai
    }
    return ligne ? [...res, ligne] : res
  })
}

const POLICE = '-apple-system, system-ui, "Segoe UI", sans-serif'

// Une étape seule, en grand.
export async function imageEtape(doc: Systeme, i: number, equipes: Equipe[]): Promise<Blob> {
  return enBlob(await rasteriser(svgEtape(doc, doc.etapes[i], equipes, 1600)), 'image/png')
}

// Tout le document sur une image : titre, étapes en grille avec leur description, fiche de l'exercice.
export async function imageDocument(doc: Systeme, equipes: Equipe[]): Promise<Blob> {
  const colonnes = doc.etapes.length > 1 ? 2 : 1
  const [L, marge] = [900, 40]
  const schemas = await Promise.all(doc.etapes.map((e) => rasteriser(svgEtape(doc, e, equipes, L))))
  const mesure = document.createElement('canvas').getContext('2d')!
  mesure.font = `26px ${POLICE}`
  const textes = doc.etapes.map((e) => lignes((t) => mesure.measureText(t).width, e.description, L))
  const hCellule = schemas[0].height + 56 + Math.max(0, ...textes.map((t) => t.length)) * 34
  const rangees = Math.ceil(doc.etapes.length / colonnes)
  const blocsFiche = fiche(doc).map(([titre, texte]) => [titre, lignes((t) => mesure.measureText(t).width, texte, colonnes * L)] as const)
  const hFiche = blocsFiche.reduce((h, [, l]) => h + 50 + l.length * 34, 0)

  const c = document.createElement('canvas')
  c.width = colonnes * L + (colonnes + 1) * marge
  c.height = 150 + rangees * (hCellule + marge) + hFiche + marge
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#142130'
  g.font = `bold 46px ${POLICE}`
  g.fillText(doc.nom, marge, 70)
  g.fillStyle = '#5b6b7b'
  g.font = `28px ${POLICE}`
  g.fillText(sousTitre(doc), marge, 115)
  schemas.forEach((s, k) => {
    const x = marge + (k % colonnes) * (L + marge)
    const y = 150 + Math.floor(k / colonnes) * (hCellule + marge)
    g.drawImage(s, x, y)
    g.fillStyle = '#142130'
    g.font = `bold 28px ${POLICE}`
    g.fillText(`Étape ${k + 1}`, x, y + s.height + 40)
    g.font = `26px ${POLICE}`
    textes[k].forEach((t, n) => g.fillText(t, x, y + s.height + 76 + n * 34))
  })
  let y = 150 + rangees * (hCellule + marge)
  for (const [titre, ls] of blocsFiche) {
    g.fillStyle = '#142130'
    g.font = `bold 28px ${POLICE}`
    g.fillText(titre, marge, y + 30)
    g.font = `26px ${POLICE}`
    ls.forEach((t, n) => g.fillText(t, marge, y + 66 + n * 34))
    y += 50 + ls.length * 34
  }
  return enBlob(c, 'image/png')
}

// Les polices standard du PDF ne connaissent pas certains signes typographiques : on les simplifie.
const pourPdf = (t: string) =>
  t.replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...').replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/ /g, ' ')

// PDF A4 paysage : une page par document (étapes en grille 2 × 2), précédée d'une couverture pour un playbook.
export async function pdfDocuments(docs: Systeme[], equipes: Equipe[], couverture?: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const [W, H, M] = [297, 210, 12]
  const texte = (t: string, x: number, y: number, taille: number, gras = false, couleur = '#142130') => {
    pdf.setFont('helvetica', gras ? 'bold' : 'normal').setFontSize(taille).setTextColor(couleur)
    pdf.text(pourPdf(t), x, y)
  }
  const paragraphe = (t: string, x: number, y: number, largeur: number, taille: number, maxLignes = 99) => {
    pdf.setFont('helvetica', 'normal').setFontSize(taille).setTextColor('#142130')
    const ls = (pdf.splitTextToSize(pourPdf(t), largeur) as string[]).slice(0, maxLignes)
    pdf.text(ls, x, y)
    return ls.length * taille * 0.42
  }
  const schema = async (doc: Systeme, e: Etape, x: number, y: number, lMax: number, hMax: number) => {
    const { largeur, hauteur } = cadre(doc.terrain)
    const [w, h] = largeur / hauteur > lMax / hMax ? [lMax, (lMax * hauteur) / largeur] : [(hMax * largeur) / hauteur, hMax]
    const image = await rasteriser(svgEtape(doc, e, equipes, 1000))
    pdf.addImage(image.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, w, h)
    return h
  }

  let premiere = true
  const nouvellePage = () => {
    if (!premiere) pdf.addPage()
    premiere = false
  }
  if (couverture) {
    nouvellePage()
    texte('Playbook', M, 40, 34, true)
    texte(couverture, M, 54, 18, false, '#5b6b7b')
    texte(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), M, 64, 12, false, '#5b6b7b')
    docs.forEach((d, k) => texte(`${k + 1}. ${d.nom}  (${d.categorie})`, M + (k >= 26 ? 140 : 0), 82 + (k % 26) * 4.6, 11))
  }

  for (const doc of docs) {
    const entete = () => {
      nouvellePage()
      texte(doc.nom, M, M + 6, 18, true)
      texte(sousTitre(doc), M, M + 13, 11, false, '#5b6b7b')
    }
    entete()
    let etapes = doc.etapes.map((e, k) => ({ e, k }))
    const haut = M + 20
    if (doc.genre === 'exercice') {
      // Exercice : premier schéma en grand à gauche, fiche à droite.
      const hImage = await schema(doc, etapes[0].e, M, haut, 165, H - haut - M - 14)
      paragraphe(etapes[0].e.description, M, haut + hImage + 6, 165, 10, 3)
      let y = haut + 4
      for (const [titre, t] of fiche(doc)) {
        texte(titre, 190, y, 12, true)
        y += 5 + paragraphe(t, 190, y + 5, W - 190 - M, 10)
        y += 6
      }
      etapes = etapes.slice(1)
      if (etapes.length) entete()
    }
    // Étapes : 1 en grand, 2 côte à côte, sinon 2 × 2 par page.
    const parPage = etapes.length === 1 ? 1 : etapes.length === 2 ? 2 : 4
    const [cols, rangs] = parPage === 1 ? [1, 1] : parPage === 2 ? [2, 1] : [2, 2]
    const lCellule = (W - 2 * M - (cols - 1) * 8) / cols
    const hCellule = (H - haut - M - (rangs - 1) * 6) / rangs
    for (let n = 0; n < etapes.length; n++) {
      if (n > 0 && n % parPage === 0) entete()
      const [cx, cy] = [M + (n % cols) * (lCellule + 8), haut + Math.floor((n % parPage) / cols) * (hCellule + 6)]
      const hImage = await schema(doc, etapes[n].e, cx, cy, lCellule, hCellule - 16)
      texte(`Étape ${etapes[n].k + 1}`, cx, cy + hImage + 5, 10, true)
      paragraphe(etapes[n].e.description, cx, cy + hImage + 10, lCellule, 9, 3)
    }
  }

  const total = pdf.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p)
    texte(`${p} / ${total}`, W - M - 10, H - 6, 9, false, '#8a96a3')
  }
  return pdf.output('blob')
}
