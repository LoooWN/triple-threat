// Trois systèmes Coaching U (schémas FastModel Sports) envoyés par Logan :
// positions relevées sur les captures (panier en haut), textes réécrits en français.
import { systeme, type Paquet } from './dsl.ts'

const src = (titre: string, genre: string) =>
  `Coaching U (schéma FastModel Sports) — « ${titre} », ${genre}. Schéma redessiné, texte réécrit.`

const systemes = [
  systeme({
    id: 'cu-3-back', nom: '3 Back', categorie: 'Attaque', duree: 10,
    source: src('3 Back', 'attaque placée'),
    miseEnPlace: 'Attaque placée. 1 avec le ballon en haut à droite, 3 à l’aile droite près du coude, 5 au coude droit, 4 en haut à gauche, 2 à l’aile gauche, bas.',
    pointsCles: 'Main à main : 1 protège le ballon avec son corps, 3 repart en frôlant son épaule.\nÉcran dans le dos : 5 s’arrête avant le contact, à un bras du défenseur de 3.\n3 coupe dès que son défenseur regarde le ballon.\nLe lob part vers le cercle, pas vers le joueur : 3 le prend en l’air ou juste devant le panier.',
    variantes: 'Si la défense change sur l’écran de 5, 5 plonge au panier : 2 peut le servir.',
  }, { 1: [9.2, 9.3], 2: [4.6, 1.2], 3: [5.8, 11.8], 4: [8.5, 4.8], 5: [5.6, 9.4] }, ['1'])
    .etape('1 attaque 3 en dribble et lui donne le ballon de la main à la main (« DHO »).', (a) => a
      .dribble('1', [6.6, 10.8]).passe('1', '3'))
    .etape('3 repart en dribble vers le haut ; 1 file au coin gauche en passant sous le panier ; 4 pose un écran à l’opposé pour 2.', (a) => a
      .dribble('3', [8.8, 9.9]).coupe('1', { c: [2.4, 10.6] }, [1, 7.5], [0.9, 1]).ecran('4', [4.8, 3.2]))
    .etape('2 sort de l’écran de 4 et remonte en haut à gauche.', (a) => a
      .coupe('2', { c: [5.8, 3] }, [8.5, 5]))
    .etape('3 passe à 2. 5 monte poser un écran dans le dos de 3 (« back screen »).', (a) => a
      .passe('3', '2').ecran('5', [6.7, 9.8]))
    .etape('3 coupe au panier en frôlant l’écran de 5 ; 2 lui envoie un lob et 3 finit au cercle.', (a) => a
      .coupe('3', { c: [6, 11.4] }, [2.6, 8.4]).passe('2', '3').tir('3')),

  systeme({
    id: 'cu-thumb-up-43', nom: 'Thumb Up 43', categorie: 'Attaque', duree: 10,
    source: src('Thumb Up 43', 'attaque placée'),
    miseEnPlace: 'Attaque placée. 1 monte le ballon côté gauche, 2 dans le coin gauche, 3 au poste bas droit, 4 au coude droit, 5 le long de la ligne de touche droite.',
    pointsCles: '3 sprinte vraiment vers le défenseur de 1 : la défense doit croire à l’écran.\n1 attaque fort du côté de l’écran pour attirer les défenseurs.\n4 s’écarte derrière la ligne à 3 points, prêt à tirer dès la réception.\n1 sert le joueur le plus ouvert : 3 à gauche ou 4 dans le coin.',
    variantes: 'Troisième option : si les défenseurs de 4 et 5 changent sur l’écran, 5 glisse vers le panier pour recevoir près du cercle.',
  }, { 1: [11.8, 4.9], 2: [2, 0.8], 3: [2, 10.2], 4: [6.4, 8.3], 5: [3.8, 14.2] }, ['1'])
    .etape('4 descend poser un écran pour 3 (« down screen »).', (a) => a
      .ecran('4', [2.9, 9.4]))
    .etape('3 sort de l’écran à toute vitesse et monte faire un faux écran (« ghost screen ») pour 1 ; en même temps, 5 vient poser un écran pour 4.', (a) => a
      .coupe('3', { c: [5.6, 10.6] }, [9.2, 7.2]).ecran('5', [3.3, 10.4]))
    .etape('1 attaque en dribble du côté de l’écran ; 3 n’attend pas le contact et glisse vers l’aile gauche ; 4 s’écarte dans le coin droit derrière l’écran de 5.', (a) => a
      .dribble('1', { c: [10.6, 8.2] }, [8.5, 11]).coupe('3', [8.3, 3.6]).coupe('4', { c: [1, 11.2] }, [1.8, 14.3]))
    .etape('Première option : 1 sert 3, seul à 3 points, qui tire.', (a) => a
      .passe('1', '3').tir('3'))
    .etape('Deuxième option : 1 sert 4 dans le coin, qui tire.', (a) => a
      .passe('1', '4').tir('4'), { ballons: ['1'] }),

  systeme({
    id: 'cu-5-flash', nom: '5 Flash', categorie: 'Remise en jeu', duree: 8,
    source: src('5 Flash', 'remise en jeu latérale'),
    miseEnPlace: 'Remise en jeu latérale côté gauche, à hauteur du coude : 2 remet en jeu. 1 près de la ligne de fond à gauche de la raquette, 4 au coude gauche, 5 dans le coin court à droite, 3 à l’aile droite pour écarter le jeu.',
    pointsCles: '1 attend que l’écran de 4 soit posé avant de sortir.\n2 entre sur le terrain dès la passe et sprinte jusqu’à l’écran.\n5 sort de l’écran mains prêtes : tir dès la réception.\nSi son défenseur arrive trop vite, 5 attaque le panier en dribble.',
  }, { 1: [1.4, 4.4], 2: [6, -0.8], 3: [8.6, 12.1], 4: [5.2, 4.6], 5: [0.9, 12] }, ['2'])
    .etape('4 descend poser un écran pour 1 (« down screen »).', (a) => a
      .ecran('4', [3.4, 4.6]))
    .etape('1 sort de l’écran et monte recevoir la remise en jeu de 2 ; 4 s’écarte vers le coin gauche.', (a) => a
      .coupe('1', { c: [4, 2.6] }, [9.8, 3.6]).passe('2', '1').coupe('4', { c: [1.6, 3.6] }, [0.9, 1]))
    .etape('2 entre sur le terrain, traverse la raquette et pose un écran pour 5 près du poste bas opposé.', (a) => a
      .ecran('2', { c: [6.6, 7.2] }, [1.8, 10.4]))
    .etape('5 contourne l’écran et surgit (« flash ») vers le coude ; 1 lui passe.', (a) => a
      .coupe('5', { c: [3.8, 11.6] }, [5.6, 8.4]).passe('1', '5'))
    .etape('5 tire dès la réception, ou attaque le panier en dribble si son défenseur arrive trop vite.', (a) => a
      .tir('5')),
]

export const coachingu: Paquet = {
  id: 'coaching-u',
  titre: 'Coaching U – 3 systèmes',
  description: '3 systèmes : « 3 Back » et « Thumb Up 43 » (attaque placée), « 5 Flash » (remise en jeu latérale).',
  credits: 'Coaching U, schémas FastModel Sports. Schémas redessinés et textes réécrits pour Triple Threat ; usage personnel.',
  systemes: systemes.map((x) => x.fin()),
  seances: [],
}
