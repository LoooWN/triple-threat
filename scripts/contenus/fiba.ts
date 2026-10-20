// Exercices et séances d'après « FIBA-WABC, Commencer à entraîner – Plans d'entraînement » (10 plans d'une heure).
// Schémas redessinés et textes reformulés pour Triple Threat.
import { ENTIER, exercice, PANIER_LOIN, seance, type Paquet } from './dsl.ts'

const SOURCE = 'FIBA-WABC, « Commencer à entraîner – Plans d’entraînement »'
const s = (plans: string) => `${SOURCE}, ${plans}.`

const exercices = [
  exercice({
    id: 'fiba-20-passes', nom: '20 passes', categorie: 'Échauffement', duree: 4, source: s('plans 1 et 2'),
    miseEnPlace: 'Deux équipes de 3 ou plus sur un demi-terrain, un ballon par équipe. Chaque équipe se fait des passes ; après chaque passe, le passeur part toucher une ligne de touche puis revient se démarquer. La première équipe à 20 passes gagne. Ballon au sol : un point en moins.',
    pointsCles: 'Arrêt simultané (deux pieds en même temps) à la réception.\nPivoter sur un pied pour trouver un partenaire.\nMains levées pour demander et attraper le ballon.',
  }, { 1: [4.3, 2.2], 2: [1.8, 4.8], 3: [11, 4.8], 4: [1.4, 12.8], 5: [4.7, 9.6], 6: [9.6, 12.3] }, ['1', '4'])
    .etape('Chaque équipe se passe le ballon ; le passeur file toucher la ligne de touche.', (a) => a
      .coupe('3', [8.4, 5.4]).passe('1', '3').coupe('1', [3.4, 0.4])
      .coupe('6', [8, 10.6]).passe('4', '6').coupe('4', [2.4, 14.6])),

  exercice({
    id: 'fiba-imitation', nom: 'Imitation', categorie: 'Échauffement', duree: 4, source: s('plans 1, 2, 5 et 6'),
    miseEnPlace: 'Par deux : un porteur de ballon face à l’entraîneur, son partenaire en défense, dos à l’entraîneur. L’entraîneur montre une direction du doigt : les porteurs dribblent dans cette direction, vite ou lentement, et le partenaire recule pour rester devant eux.',
    pointsCles: 'Tête levée pour voir le signal de l’entraîneur.\nDribble fort : pousser le ballon vers le sol aussi fort que possible.',
  }, { 1: [1, 2.6], X1: [3.2, 2.6], 2: [1, 7.5], X2: [3.2, 7.5], 3: [1, 12.4], X3: [3.2, 12.4], C: [9.9, 7.5] }, ['1', '2', '3'])
    .etape('L’entraîneur montre une direction : les dribbleurs y vont, les défenseurs restent devant.', (a) => a
      .dribble('1', [5.6, 4.1]).coupe('X1', [6.6, 4.8])
      .dribble('2', [5.6, 9]).coupe('X2', [6.6, 9.7])
      .dribble('3', [5.6, 13.9]).coupe('X3', [6.6, 14.4])),

  exercice({
    id: 'fiba-passer-et-couper', nom: 'Passer et couper', categorie: 'Passe', duree: 5, source: s('plans 1, 2, 3 et 10'),
    miseEnPlace: 'Trois colonnes : 1 et 2 au milieu du terrain, 3 et 4 derrière la ligne de fond avec un ballon, 5 et 6 sur la touche opposée à l’entraîneur. 1 passe à l’entraîneur et coupe au panier ; 3 lui passe et 1 tire. Quand 1 a passé la ligne des lancers francs, 5 coupe vers l’entraîneur, reçoit et attaque le panier en dribble.\nRotation : 1 va derrière 6, 5 prend son propre rebond et va derrière 4, 3 prend le rebond de 1 et va derrière 2.',
    pointsCles: 'Arrêt simultané avant de tirer.\nLe timing : 1 ne coupe que lorsque l’entraîneur a le ballon ; 5 ne coupe que lorsque 1 a passé la ligne des lancers francs.',
  }, { 1: [9.7, 9.7], 2: [11.4, 9.7], 3: [-0.4, 10.2], 4: [-0.4, 11.3], 5: [6.1, 1.4], 6: [6.1, 0.4], C: [6.1, 14] }, ['1', '3'])
    .etape('1 passe à l’entraîneur et coupe au panier ; 3 lui passe et 1 tire.', (a) => a
      .passe('1', 'C').coupe('1', [2.6, 8.4]).passe('3', '1').tir('1'))
    .etape('5 coupe vers l’entraîneur, reçoit et attaque le panier en dribble.', (a) => a
      .coupe('5', [6.1, 7]).passe('C', '5'))
    .etape('5 finit en dribble et tire, puis tout le monde tourne.', (a) => a
      .dribble('5', [2.9, 7.3]).tir('5')),

  exercice({
    id: 'fiba-double-pas', nom: 'Travail du double-pas', categorie: 'Tir', duree: 5, source: s('plans 1 à 3'),
    miseEnPlace: 'Présenter le double-pas pas à pas : d’abord sauter pour taper dans la main de l’entraîneur, puis avec un tir. Commencer près du panier, au poste bas, et travailler des deux côtés. Utiliser plusieurs paniers pour éviter l’attente.',
    pointsCles: 'Partir du poste bas comme repère.\nUn pas avec le pied côté ligne de fond, puis sauter vers le panier.\nAttraper, un pas, tirer !',
    variantes: 'Pour les plus jeunes : commencer avec une balle de tennis ou un ballon de taille 3.',
  }, { 1: [5.8, 12], 2: [6.7, 12.7], 3: [7.6, 13.3], C: [1.2, 9.3] }, ['1', '2', '3'])
    .etape('Depuis le poste bas : un pas, sauter vers le panier, tirer.', (a) => a.dribble('1', [3.1, 10.2]).tir('1')),

  exercice({
    id: 'fiba-dribble-du-poulet', nom: 'Le dribble du poulet', categorie: 'Dribble', duree: 4, source: s('plans 1 et 3 à 6'),
    miseEnPlace: 'Par deux, face à face, un ballon chacun. Les deux dribblent l’un vers l’autre de la même main et changent de main en se croisant, puis continuent. Plusieurs paires en même temps : on peut ralentir ou dribbler sur place pour éviter les autres.',
    pointsCles: 'Tête levée pour voir les autres joueurs.\nChangement de main entre le genou et la hanche, ballon poussé fort.',
  }, { 1: [3.6, 7.6], 2: [12.2, 7.4], 3: [7.5, 0.9], 4: [7.3, 14.1] }, ['1', '2', '3', '4'])
    .etape('Les deux partenaires dribblent l’un vers l’autre et changent de main en se croisant.', (a) => a
      .dribble('1', [12, 8.1]).dribble('2', [3.8, 6.9]).dribble('3', [7.9, 14]).dribble('4', [6.9, 1])),

  exercice({
    id: 'fiba-dribbler-pivoter-passer', nom: 'Dribbler, pivoter et passer', categorie: 'Passe', duree: 4, source: s('plans 1 à 3 et 8 à 10'),
    miseEnPlace: 'Groupes de 4 minimum, en colonne. Le premier dribble vers la raquette et fait un arrêt simultané ; le deuxième court derrière lui. Le dribbleur pivote et passe au suivant de la colonne pendant que le deuxième essaie d’intercepter. Les deux reviennent dans la colonne en changeant de rôle.',
    pointsCles: 'Feinter, puis pivoter pour passer.\nPas de passe lobée.\nSavoir passer de la main gauche comme de la droite.',
  }, { 1: [6, 1.8], X1: [6.7, 1.1], 2: [6.2, 0.3], 3: [6.9, 0.3] }, ['1'])
    .etape('1 dribble et s’arrête ; son partenaire le suit pour gêner la passe.', (a) => a
      .dribble('1', [6, 5.3]).coupe('X1', [6.4, 4.4]))
    .etape('1 pivote et passe au suivant de la colonne ; le défenseur essaie d’intercepter.', (a) => a
      .passe('1', '2', [7.4, 2.8])),

  exercice({
    id: 'fiba-passer-et-gagner', nom: 'Passer et gagner', categorie: 'Jeu réduit', duree: 7, source: s('plans 1 et 2'),
    miseEnPlace: 'Deux équipes à effectif égal, chacun marque un adversaire. L’équipe qui attaque part du rond central et doit amener le ballon dans la zone de non-charge par passes et dribbles. Si la défense récupère le ballon, elle attaque vers son propre but. Après un point, l’autre équipe repart avec le ballon.',
    pointsCles: 'Défenseurs : voir à la fois son joueur et le ballon.\nInterdit d’arracher le ballon des mains : on intercepte les passes.\nPas de point en dribblant : le point se marque par une passe à un partenaire dans la zone du panier.',
  }, { 1: [13.1, 7.5], X1: [11.9, 7.3], 2: [10.2, 3.1], X2: [10.2, 4.6], 3: [6.8, 12.9], X3: [6.6, 11.3] }, ['1'])
    .etape('1 sort du rond central et passe à 2.', (a) => a.passe('1', '2'))
    .etape('2 remonte en dribble pendant que 3 coupe vers le panier ; passe dans la zone : point !', (a) => a
      .dribble('2', [6.3, 2]).coupe('X2', [6.5, 3.2]).coupe('3', [2.5, 7.4]).coupe('X3', [3.3, 8.4]).passe('2', '3')),

  exercice({
    id: 'fiba-dans-la-raquette', nom: 'Dans la raquette', categorie: 'Jeu réduit', duree: 7, source: s('plan 1'),
    miseEnPlace: 'Équipes à effectif égal sur un demi-terrain. Par passes et dribbles, l’attaque essaie de pénétrer dans la raquette avec le ballon. L’entraîneur peut jouer en attaque pour raccourcir les passes ; des plots peuvent marquer les places sur le périmètre.',
    pointsCles: 'Garder 2 à 3 mètres entre attaquants.\nPénétrer dans la raquette, puis ressortir au périmètre.\nAprès une passe, couper au panier puis revenir.',
  }, { 1: [5.9, 0.9], X1: [5.6, 2.6], 2: [10.2, 6.5], X2: [8.7, 6.3], 3: [5.9, 14.1], X3: [6.3, 11.4], C: [9, 10] }, ['2'])
    .materiel('plot', [7, 0.9], [10.8, 7.5], [7, 14.1])
    .etape('2 passe à l’entraîneur, 3 coupe au panier.', (a) => a
      .passe('2', 'C').coupe('3', [2.6, 10.6]).coupe('X3', [3.5, 10.9])),

  exercice({
    id: 'fiba-5-possessions', nom: '5 possessions', categorie: 'Jeu réduit', duree: 10, source: s('plans 1 à 6 et 8'),
    miseEnPlace: 'Équipes à effectif égal, chacun marque un adversaire. L’entraîneur passe à un attaquant. L’attaque marque 1 point si elle atteint la raquette avec le ballon, 2 points pour un panier marqué dans la raquette. Si la défense récupère, elle rend le ballon à l’entraîneur et on rejoue. Après 5 possessions, on inverse les rôles.',
    pointsCles: 'Attaquer la raquette uniquement en dribble (l’entraîneur peut limiter le nombre de dribbles).\nGarder 2 à 3 mètres entre attaquants.\nChaque défenseur reste avec son joueur.',
  }, { 1: [2.6, 0.6], X1: [3.8, 2], 3: [7.6, 2.8], X3: [7.6, 4.6], 2: [7.3, 13.5], X2: [7.3, 11.9], C: [11, 8.5] }, ['C'])
    .etape('L’entraîneur passe à 3.', (a) => a.passe('C', '3'))
    .etape('3 attaque la raquette en dribble et trouve 1 qui coupe.', (a) => a
      .dribble('3', [4.6, 5.6]).coupe('X3', [5.2, 6.4]).coupe('1', [2.2, 6.2]).coupe('X1', [3, 5.4]).passe('3', '1')),

  exercice({
    id: 'fiba-crocodile', nom: 'Crocodile', categorie: 'Retour au calme', duree: 5, source: s('plans 1 et 2'),
    miseEnPlace: 'Les joueurs font la queue pour tirer près du panier. Tir réussi : courir toucher la ligne médiane et revenir dans la file. Tir raté : aller dans le « crocodile », debout sur le côté près du panier. Chaque tir réussi libère un joueur du crocodile. S’il ne reste qu’un tireur, il libère tout le monde en marquant.',
    pointsCles: 'Être équilibré avant de tirer.\nPousser le ballon vers le haut (récompenser les plus jeunes quand ils touchent le filet ou l’arceau).',
  }, { 1: [3.6, 10.4], 2: [4.3, 11.1], 3: [5, 11.8], 4: [5.7, 12.5], 5: [1.2, 13.4], 6: [2, 13.9] }, ['1', '2', '3', '4'])
    .etape('1 tire : s’il marque, il court toucher la ligne médiane ; sinon, il rejoint le crocodile.', (a) => a
      .tir('1').coupe('1', [9.6, 11.4], [13.6, 11]).texte([0.4, 12.2], 'Crocodile')),

  exercice({
    id: 'fiba-dribbler-et-passer', nom: 'Dribbler et passer', categorie: 'Passe', duree: 4, source: s('plan 2'),
    miseEnPlace: 'Quatre colonnes autour de la ligne des lancers francs, un ballon en tête de chaque colonne. Le premier dribble vers la ligne des lancers francs, fait un arrêt simultané, pivote (avant ou arrière, selon l’entraîneur) et passe au suivant de sa colonne, puis va se placer en bout de colonne.',
    pointsCles: 'Dribbler tête levée.\nArrêt simultané : le nez derrière les orteils.',
  }, { 1: [12.3, 7.5], 5: [13.2, 7.5], 2: [1.1, 7.5], 6: [0.3, 7.5], 3: [6.2, 1], 7: [6.2, 0.2], 4: [6.2, 14], 8: [6.2, 14.8] }, ['1', '2', '3', '4'])
    .etape('Chacun dribble vers la ligne des lancers francs, s’arrête, pivote et passe au suivant de sa colonne.', (a) => a
      .dribble('1', [8, 7.5]).passe('1', '5').dribble('2', [4.2, 7.5]).passe('2', '6')
      .dribble('3', [6, 5]).passe('3', '7').dribble('4', [6, 10]).passe('4', '8')),

  exercice({
    id: 'fiba-jeu-des-points', nom: 'Jeu des points', categorie: 'Jeu réduit', duree: 7, source: s('plans 2 à 4 et 8'),
    miseEnPlace: 'Six plots répartis sur le demi-terrain, équipes de 3 à 5. On ne peut passer qu’à un partenaire placé à côté d’un plot ou dans la raquette. Passe vers un plot : 1 point ; passe dans la raquette : 3 points ; arriver en dribble dans la raquette : 1 point. Si la défense récupère le ballon, elle passe en attaque.',
    pointsCles: 'Défenseurs : voir son joueur et le ballon.\nPas d’arrachage : on intercepte les passes.',
  }, { 1: [8.6, 7.5], X1: [7.5, 7.5], 2: [5.4, 2.6], X2: [5, 3.8], 3: [5.4, 12.4], X3: [5, 11.2] }, ['1'])
    .materiel('plot', [0.8, 0.9], [3, 1], [0.8, 14.1], [3, 14], [6.5, 5], [6.5, 10])
    .etape('2 va se placer au plot et reçoit : 1 point.', (a) => a
      .coupe('2', [3.2, 1.6]).coupe('X2', [3.8, 2.6]).passe('1', '2').texte([3.4, 7.5], 'Raquette : 3 pts')),

  exercice({
    id: 'fiba-20-passes-marquage', nom: '20 passes avec marquage', categorie: 'Échauffement', duree: 4, source: s('plans 3 à 5'),
    miseEnPlace: 'Deux équipes, un seul ballon, mêmes règles que les « 20 passes ». La défense doit récupérer le ballon puis faire à son tour 20 passes pour gagner. Le compteur repart à zéro si le ballon tombe.',
    pointsCles: 'Chaque défenseur marque un adversaire.\nSe placer entre son joueur et le porteur du ballon.',
  }, { 1: [4.2, 2], X1: [5.2, 3], 2: [1.4, 4.7], X2: [2.6, 5.2], 3: [10.8, 4.7], X3: [9.6, 5.5] }, ['1'])
    .etape('3 se démarque et reçoit, 1 file vers la touche ; chaque défenseur reste entre son joueur et le ballon.', (a) => a
      .coupe('3', [7.6, 6.6]).coupe('X3', [6.8, 5.4]).passe('1', '3').coupe('1', [3, 0.5]).coupe('X1', [4.6, 2.2])),

  exercice({
    id: 'fiba-dribble-et-chaos', nom: 'Dribble et chaos', categorie: 'Dribble', duree: 4, source: s('plans 3 et 4'),
    miseEnPlace: 'Deux joueurs de chaque équipe dans la raquette : chacun dribble pendant que son adversaire direct essaie de faire sortir son ballon de la raquette. Ballon sorti (ou reprise de dribble) : le joueur sort et un coéquipier entre à sa place avec le ballon. Les joueurs à l’extérieur peuvent chiper le ballon mais n’ont pas le droit d’entrer dans la raquette.',
    pointsCles: 'Dribbler tête levée.\nDribble fort, protéger le ballon avec le corps.',
  }, { 1: [3.4, 6.4], X1: [3, 8], X2: [5.2, 8.4], 2: [4.9, 6.6], 3: [7, 5.6], 4: [2.4, 3.8], X3: [7, 9.6], X4: [0.6, 11] }, ['1', 'X2'])
    .etape('Chacun garde son ballon dans la raquette pendant que l’adversaire essaie de le faire sortir.', (a) => a
      .dribble('1', [4.4, 7.6]).coupe('X1', [3.8, 8.6]).dribble('X2', [3.8, 9.1]).coupe('2', [4.6, 8.8])),

  exercice({
    id: 'fiba-tallyball', nom: 'Tallyball', categorie: 'Jeu réduit', terrain: ENTIER, duree: 7, source: s('plans 3 à 7'),
    miseEnPlace: 'Deux équipes à effectif égal sur tout le terrain. Une équipe doit enchaîner 6 passes, puis passer à un partenaire dans la raquette pour marquer un point. Après un point, l’équipe adverse repart avec le ballon depuis la raquette. Ballon au sol : le compteur repart à zéro.',
    pointsCles: 'Aller vers le ballon et ne pas s’arrêter tant qu’il n’est pas attrapé.\nSi la passe va à un autre, s’écarter pour lui laisser l’espace.',
  }, { 1: [5, 3], X1: [6.2, 4.2], 2: [9.5, 11], X2: [10.6, 10.2], 3: [16, 4], X3: [17, 5], 4: [24, 7.5], X4: [22.6, 7.5], 5: [12.5, 7.5], X5: [13.6, 8.4] }, ['1'])
    .etape('Six passes de suite, puis une passe dans la raquette : 1 point.', (a) => a
      .coupe('5', [9.6, 5.6]).coupe('X5', [10.6, 6.4]).passe('1', '5').texte([2.6, 7.5], '6 passes puis raquette')),

  exercice({
    id: 'fiba-autour-du-monde', nom: 'Autour du monde', categorie: 'Retour au calme', duree: 5, source: s('plans 3 à 6'),
    miseEnPlace: 'Choisir 6 à 10 positions de tir adaptées aux joueurs (marquées par des plots). Chacun tire à la première position ; panier marqué : on avance à la position suivante ; tir raté : au suivant de tirer. Le premier à marquer de toutes les positions gagne. Après 3 échecs au même endroit, on passe à la position suivante. Un ballon par joueur si possible.',
    pointsCles: 'Être équilibré avant de tirer.\nPousser le ballon vers le haut (récompenser les plus jeunes quand ils touchent le filet ou l’arceau).',
  }, { 1: [1.6, 2.8], 2: [2.2, 2], 3: [2.8, 1.3] }, ['1', '2', '3'])
    .materiel('plot', [1.2, 3.5], [3.2, 3.6], [4.9, 5.2], [5.5, 7.5], [4.9, 9.8], [3.2, 11.4], [1.2, 11.5])
    .etape('On tire à la première position ; panier marqué : on passe à la suivante.', (a) => a.tir('1')),

  exercice({
    id: 'fiba-double-pas-etoile', nom: 'Double-pas en étoile', categorie: 'Tir', duree: 5, source: s('plans 4 à 10'),
    miseEnPlace: 'Cinq places en étoile autour de la raquette. 1 dribble et passe à 2, 2 dribble et passe à 3, 3 dribble et passe à 4, 4 passe à 5 qui coupe et finit en double-pas. 6 prend le rebond, relance et l’exercice continue. Chacun prend la place où il vient de passer.',
    pointsCles: 'Demander le ballon (bras tendus, voix).',
    variantes: 'Au lieu de dribbler, venir au-devant du ballon pour le recevoir.',
  }, { 1: [0.9, 4.6], 6: [-0.5, 4.3], 2: [5.4, 13.9], 3: [5.4, 0.9], 4: [0.3, 10.1], 5: [10.4, 7.4] }, ['1'])
    .etape('1 dribble et passe à 2.', (a) => a.dribble('1', [3, 5.6]).passe('1', '2'))
    .etape('2 dribble et passe à 3.', (a) => a.dribble('2', [5.4, 11.8]).passe('2', '3'))
    .etape('3 dribble et passe à 4.', (a) => a.dribble('3', [5.4, 3]).passe('3', '4'))
    .etape('4 passe à 5 qui coupe et finit en double-pas ; 6 prend le rebond.', (a) => a
      .coupe('5', [2.6, 7.6]).passe('4', '5').tir('5')),

  exercice({
    id: 'fiba-double-pas-vitesse', nom: 'Double-pas à toute vitesse', categorie: 'Tir', duree: 5, source: s('plans 4 à 7'),
    miseEnPlace: 'Toute l’équipe enchaîne les double-pas avec un objectif commun : 10 double-pas de suite où le ballon touche la planche sans toucher l’arceau.',
    pointsCles: 'Sauter vers le panier, pas en longueur vers la ligne de fond.',
  }, { 1: [7, 13.2], 2: [7.8, 13.7], 3: [8.6, 14.2], 4: [2.4, 4.4] }, ['1', '2', '3'])
    .etape('Double-pas à pleine vitesse ; 4 prend le rebond et ressort le ballon.', (a) => a
      .dribble('1', [2.8, 9.9]).tir('1')),

  exercice({
    id: 'fiba-defendre-les-cercles', nom: 'Défendre les cercles', categorie: 'Défense', duree: 4, source: s('plans 4 à 7 et 10'),
    miseEnPlace: 'Un attaquant et un défenseur partent d’un coin. L’attaquant a 10 secondes pour atteindre en dribble la zone de non-charge, le cercle des lancers francs ou le cercle central. Le défenseur l’oriente vers la ligne de touche. L’action s’arrête si l’attaquant perd le ballon ou sort du terrain.',
    pointsCles: 'Le défenseur n’a pas besoin de prendre le ballon : il suffit de bloquer le dribbleur pendant 10 secondes.',
  }, { 1: [0.7, 0.8], X1: [1.5, 1.7] }, ['1'])
    .etape('1 attaque un des cercles en dribble ; X1 l’oriente vers la touche.', (a) => a
      .dribble('1', [6.5, 2.6], [12.4, 6.6]).coupe('X1', [6.8, 3.6], [12.2, 7.6]).texte([13.4, 7.5], 'Cercle central')),

  exercice({
    id: 'fiba-ballon-dans-le-cerceau', nom: 'Ballon dans le cerceau', categorie: 'Jeu réduit', duree: 7, source: s('plans 5 à 7'),
    miseEnPlace: 'Deux cerceaux posés au sol de chaque côté du terrain, un joueur de chaque équipe dans le cerceau de son équipe. Par passes et dribbles, une équipe marque en passant à son partenaire placé dans son cerceau. Après un point, l’autre équipe repart de la ligne médiane.',
    pointsCles: 'Défenseurs : voir son joueur et le ballon.\nPas d’arrachage : on intercepte les passes.',
  }, { 1: [5.6, 0.8], X1: [5.6, 14.2], 2: [1.8, 5.4], X2: [2.6, 4.6], 3: [10.6, 3.6], X3: [9.6, 3.9], 4: [3.3, 9.6], X4: [2.8, 10.6] }, ['2'])
    .etape('2 trouve 1 dans le cerceau : point !', (a) => a
      .coupe('4', [6.4, 10.4]).coupe('X4', [5.4, 10.8]).passe('2', '1')
      .texte([4.4, 0.8], 'Cerceau').texte([4.4, 14.2], 'Cerceau')),

  exercice({
    id: 'fiba-dribble-en-slalom', nom: 'Dribble en slalom', categorie: 'Dribble', terrain: ENTIER, duree: 5, source: s('plans 6 à 8'),
    miseEnPlace: 'Deux équipes en colonne. Chacun dribble en slalom autour des plots puis finit par un double-pas. L’équipe gagnante atteint un nombre de points fixé (ou en a le plus à la fin du temps). Un adulte près de chaque plot essaie de toucher le ballon s’il n’est pas protégé.',
    pointsCles: 'Changer de main à chaque plot.\nProtéger le ballon avec le corps.',
  }, { 1: [14.8, 14.2], 2: [15.8, 14.2], 3: [16.8, 14.2], 4: [13.2, 0.8], 5: [12.2, 0.8], 6: [11.2, 0.8], C: [7.2, 11.6] }, ['1', '2', '3', '4', '5', '6'])
    .materiel('plot', [11, 12.4], [7.4, 10.4], [4.4, 11.6], [17, 2.6], [20.6, 4.6], [23.6, 3.4])
    .etape('Slalom en dribble autour des plots, puis double-pas.', (a) => a
      .dribble('1', [11.6, 13.2], [7.6, 9.6], [4.2, 12.4], [2.6, 9.2]).tir('1')
      .dribble('4', [17, 1.8], [20.6, 5.4], [23.6, 2.6], [25.6, 6]).tir('4', undefined, PANIER_LOIN)),

  exercice({
    id: 'fiba-chat-et-souris', nom: 'Jouer à chat et souris', categorie: 'Échauffement', duree: 4, source: s('plans 7 et 8'),
    miseEnPlace: 'Trois joueurs sont les « chats », avec un ballon ; les autres sont les « souris », dans une zone limitée (par exemple l’intérieur de la ligne à 3 points). Les chats se passent le ballon et doivent toucher une souris avec le ballon tenu en main, sans le lancer. Toucher le plus de souris possible dans le temps donné.',
    pointsCles: 'Les chats se déplacent ensemble.\nPas de marcher : on peut pivoter.',
  }, { X1: [1.4, 5.6], X2: [4, 5.5], X3: [1.7, 10.4], 1: [1, 13], 2: [1, 2.2], 3: [3.8, 8.3], 4: [4.4, 10.8], 5: [5, 6.8] }, ['X1'])
    .etape('Les chats se passent le ballon pour coincer une souris ; elle s’enfuit.', (a) => a
      .coupe('X3', [3.6, 8.9]).passe('X1', 'X3').coupe('3', [6, 9.8]).texte([7.6, 7.5], 'Zone : intérieur des 3 points')),

  exercice({
    id: 'fiba-go', nom: 'GO', categorie: 'Jeu réduit', duree: 4, source: s('plans 7 à 10'),
    miseEnPlace: 'Deux contre deux (ou plus) : les attaquants se font des passes en avançant, les défenseurs les suivent. À tout moment, l’attaque peut annoncer « GO » et attaquer le panier. La défense essaie de l’empêcher d’entrer dans la raquette.',
    pointsCles: 'Dribbler tête levée.\nArrêt simultané : le nez derrière les orteils.',
  }, { 1: [10.2, 1], X1: [8.2, 0.6], 2: [8.2, 2.4], X2: [9.6, 2.9] }, ['1'])
    .etape('Les attaquants avancent en se passant le ballon.', (a) => a
      .coupe('2', [8.2, 5.4]).coupe('X2', [9.4, 5.6]).passe('1', '2').coupe('1', [10, 4.4]).coupe('X1', [8.6, 3.6]))
    .etape('« GO ! » : 2 attaque le panier en dribble.', (a) => a
      .dribble('2', [8.8, 9.2], [3.6, 9]).coupe('X2', [4.4, 8.4]).tir('2')),

  exercice({
    id: 'fiba-enfant-en-or', nom: 'Enfant en or', categorie: 'Retour au calme', duree: 5, source: s('plans 7 à 10'),
    miseEnPlace: 'Deux équipes. L’une tire, en colonne près du panier ; l’autre part du coin du terrain. Pendant chaque tir, un coureur fait le tour de la ligne à 3 points ; il s’arrête quand le tir est pris et le suivant part. Le dernier coureur est l’« enfant en or » : quand un coureur rattrape un coéquipier, celui-ci repart. L’équipe qui court marque 1 point chaque fois qu’un joueur revient à sa place.',
    pointsCles: 'Être équilibré avant de tirer.\nPousser le ballon vers le haut.',
  }, { 1: [3.6, 7.5], 2: [4.4, 7.5], 3: [5.2, 7.5], X1: [6.2, 2.4], X2: [7.6, 4.4], X3: [0.4, 0.6] }, ['1', '2', '3'])
    .etape('Pendant le tir, le coureur fait le tour de la ligne à 3 points.', (a) => a
      .tir('1').coupe('X1', { c: [10.4, 7.5] }, [6.2, 12.6])),

  exercice({
    id: 'fiba-tir-sous-pression', nom: 'Tir sous pression', categorie: 'Tir', duree: 5, source: s('plans 8 à 10'),
    miseEnPlace: 'Deux équipes en compétition : la première à réussir les 10 tirs demandés par l’entraîneur gagne. Jusqu’à 3 paniers, un tir raté renvoie l’équipe à zéro ; jusqu’à 5 paniers, un tir raté fait perdre un point.',
    pointsCles: 'Choisir des tirs à la portée des joueurs.\nÊtre équilibré, pousser le ballon vers le haut.',
  }, { 1: [5.6, 3.6], 2: [6.4, 3], 3: [7.2, 2.4], 4: [5.6, 11.4], 5: [6.4, 12], 6: [7.2, 12.6] }, ['1', '2', '3', '4', '5', '6'])
    .etape('Chaque équipe tire à tour de rôle et compte ses paniers.', (a) => a.tir('1').tir('4')),

  exercice({
    id: 'fiba-queue-de-tigre', nom: 'Queue de tigre', categorie: 'Échauffement', duree: 4, source: s('plan 9'),
    miseEnPlace: 'Chaque joueur glisse un ruban à l’arrière de son short. Tous courent et essaient de prendre les rubans des autres ; celui qui en a le plus gagne. Au coup de sifflet, tout le monde s’arrête : un joueur qui bouge encore donne ses rubans au plus proche. Un joueur qui perd son ruban peut le remplacer par un ruban pris à un autre.',
    pointsCles: 'Rester en mouvement, regarder autour de soi.',
    variantes: 'Faire dribbler certains joueurs, ou tous, pour corser l’exercice.',
  }, { 1: [3, 3], 2: [5.5, 9.5], 3: [8, 4.5], 4: [10.5, 11], 5: [12, 6], 6: [6.5, 13] })
    .etape('Tout le monde court pour prendre les rubans des autres.', (a) => a
      .coupe('1', [5, 5]).coupe('3', [6.4, 3]).coupe('2', [7.4, 11]).coupe('4', [8.6, 12.4]).coupe('5', [10.4, 8]).coupe('6', [4.6, 12])),

  exercice({
    id: 'fiba-dribble-et-elimination', nom: 'Dribble et élimination', categorie: 'Dribble', duree: 5, source: s('plan 9'),
    miseEnPlace: 'Chaque joueur a un ballon (si possible) dans une zone limitée, par exemple l’intérieur de la ligne à 3 points, et essaie de faire perdre le ballon aux autres tout en gardant le sien. Ballon perdu : le joueur sort, et on réduit la zone au fur et à mesure. Le dernier en jeu gagne. Sans assez de ballons : prendre un ballon libre, puis dribbler.',
    pointsCles: 'Tête levée, changer de main pour éviter les adversaires.',
    variantes: 'Les plus avancés : dribbler de la main faible, voire avec deux ballons.',
  }, { 1: [2.4, 4.4], 2: [4.6, 6.6], 3: [3, 10], 4: [5.8, 9.4], 5: [6.6, 4.4], 6: [1.4, 7.5] }, ['1', '2', '3', '4', '5', '6'])
    .etape('Chacun protège son ballon et essaie de faire perdre celui des autres.', (a) => a
      .dribble('2', [4.4, 8.4]).dribble('5', [5.6, 6.2]).dribble('1', [2.6, 6]).texte([8, 7.5], 'Zone : intérieur des 3 points')),

  exercice({
    id: 'fiba-2-contre-1-continu', nom: '2 contre 1 en continu', categorie: 'Jeu réduit', terrain: ENTIER, duree: 7, source: s('plans 9 et 10'),
    miseEnPlace: 'Deux attaquants contre un défenseur sur tout le terrain. Quand la défense récupère le ballon (ou après un panier), le défenseur devient attaquant : un coéquipier le rejoint depuis la touche et ils attaquent l’autre panier à 2 contre 1. Les deux anciens attaquants sortent vers les lignes de touche ; un joueur de leur équipe défend à l’autre panier. Et ainsi de suite.',
    pointsCles: 'Le porteur passe vers l’avant dès que son partenaire le regarde.\nLe dribbleur attaque le panier pour un double-pas ; si le défenseur le prend, il passe.\nLe défenseur feinte pour que le dribbleur ne sache pas qui il marque.',
  }, { 1: [9, 10.5], 2: [9.5, 3], X1: [4.6, 7.5], X2: [4.2, 15.2], 3: [24.4, 7.5] }, ['1'])
    .etape('1 et 2 attaquent à 2 contre 1 : 1 fixe le défenseur et passe à 2.', (a) => a
      .dribble('1', [4, 9]).coupe('2', [3.4, 4.6]).coupe('X1', [3.6, 7.8]).passe('1', '2').tir('2'))
    .etape('X1 récupère, X2 le rejoint : ils attaquent l’autre panier à 2 contre 1 contre 3.', (a) => a
      .dribble('X1', [12, 7], [21, 7.4]).coupe('X2', [12, 13.6], [22, 12]).coupe('1', [9, 15]).coupe('2', [9, 0]).passe('X1', 'X2'),
    { ballons: ['X1'] }),

  exercice({
    id: 'fiba-match-amical', nom: 'Match amical', categorie: 'Jeu réduit', terrain: ENTIER, duree: 10, source: s('plans 9 et 10'),
    miseEnPlace: 'Le match se joue en deux mi-temps. En première mi-temps, une équipe attaque et l’autre défend. Quand la défense récupère le ballon, elle file à l’autre panier et tire jusqu’à marquer, sans opposition ; puis on rejoue une nouvelle possession. À la mi-temps, on inverse les rôles.',
    pointsCles: 'L’équipe qui défend marque à chaque récupération : la défense est récompensée.',
    variantes: 'L’entraîneur peut changer la façon de marquer : amener le ballon dans la raquette, toucher l’arceau, etc.',
  }, { 1: [8.8, 7.5], X1: [7.6, 7.4], 2: [6, 2.4], X2: [5.4, 3.4], 3: [6, 12.6], X3: [5.4, 11.6] }, ['1'])
    .etape('X2 intercepte la passe…', (a) => a.passe('1', '2').coupe('X2', [5.8, 2.6]), {})
    .etape('… et file marquer à l’autre panier, sans opposition.', (a) => a
      .dribble('X2', [14, 4.4], [24.8, 6.8]).tir('X2', undefined, PANIER_LOIN), { ballons: ['X2'] }),

  exercice({
    id: 'fiba-passer-couper-2c2', nom: 'Passer et couper (2 contre 2)', categorie: 'Passe', duree: 7, source: s('plans 8 à 10'),
    miseEnPlace: 'Deux contre deux avec l’entraîneur en appui. 1 peut passer à l’entraîneur ou à 2, puis coupe vers le panier. L’attaque marque si elle amène le ballon dans la raquette ; la défense gagne si elle récupère le ballon ou si l’attaque n’atteint pas la raquette en 10 secondes. Quand 1 passe à l’entraîneur, 2 attend que 1 ait coupé.',
    pointsCles: 'Défenseurs : voir son joueur et le ballon.\nSe placer entre son joueur et le porteur du ballon.',
  }, { 1: [11, 7.2], X1: [9.4, 6.6], 2: [10.8, 11.4], X2: [9.2, 10.2], C: [5.6, 0.6] }, ['1'])
    .etape('1 passe à l’entraîneur et coupe vers le panier.', (a) => a
      .passe('1', 'C').coupe('1', [4.2, 5.4]).coupe('X1', [4.8, 6.2]))
    .etape('L’entraîneur lui rend le ballon dans la course ; 2 coupe à son tour.', (a) => a
      .passe('C', '1').coupe('2', [5, 9.4]).coupe('X2', [6, 9.8])),
]

const docs = exercices.map((d) => d.fin())
const P = (n: number) => `fiba-plan-${n}`
const pause = (m: number) => `Puis pause boisson (${m} min).`
const seances = [
  seance(P(1), 'Plan FIBA n°1', [['fiba-20-passes', 4], ['fiba-imitation', 4, pause(1)], ['fiba-passer-et-couper', 5], ['fiba-double-pas', 5], ['fiba-dribble-du-poulet', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-passer-et-gagner', 7], ['fiba-dans-la-raquette', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-crocodile', 5]]),
  seance(P(2), 'Plan FIBA n°2', [['fiba-20-passes', 4], ['fiba-imitation', 4, pause(1)], ['fiba-passer-et-couper', 5], ['fiba-double-pas', 5], ['fiba-dribbler-et-passer', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-jeu-des-points', 7], ['fiba-passer-et-gagner', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-crocodile', 5]]),
  seance(P(3), 'Plan FIBA n°3', [['fiba-20-passes-marquage', 4], ['fiba-dribble-et-chaos', 4, pause(1)], ['fiba-passer-et-couper', 5], ['fiba-double-pas', 5], ['fiba-dribble-du-poulet', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-jeu-des-points', 7], ['fiba-tallyball', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-autour-du-monde', 5]]),
  seance(P(4), 'Plan FIBA n°4', [['fiba-20-passes-marquage', 4], ['fiba-dribble-et-chaos', 4, pause(1)], ['fiba-double-pas-etoile', 5], ['fiba-double-pas-vitesse', 5], ['fiba-dribble-du-poulet', 4], ['fiba-defendre-les-cercles', 4, pause(2)], ['fiba-jeu-des-points', 7], ['fiba-tallyball', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-autour-du-monde', 5]]),
  seance(P(5), 'Plan FIBA n°5', [['fiba-20-passes-marquage', 4], ['fiba-imitation', 4, pause(1)], ['fiba-double-pas-etoile', 5], ['fiba-double-pas-vitesse', 5], ['fiba-dribble-du-poulet', 4], ['fiba-defendre-les-cercles', 4, pause(2)], ['fiba-ballon-dans-le-cerceau', 7], ['fiba-tallyball', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-autour-du-monde', 5]]),
  seance(P(6), 'Plan FIBA n°6', [['fiba-double-pas-etoile', 4], ['fiba-imitation', 4, pause(1)], ['fiba-dribble-en-slalom', 5], ['fiba-double-pas-vitesse', 5], ['fiba-dribble-du-poulet', 4], ['fiba-defendre-les-cercles', 4, pause(2)], ['fiba-ballon-dans-le-cerceau', 7], ['fiba-tallyball', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-autour-du-monde', 5]]),
  seance(P(7), 'Plan FIBA n°7', [['fiba-double-pas-etoile', 4], ['fiba-chat-et-souris', 4, pause(1)], ['fiba-dribble-en-slalom', 5], ['fiba-double-pas-vitesse', 5], ['fiba-go', 4], ['fiba-defendre-les-cercles', 4, pause(2)], ['fiba-ballon-dans-le-cerceau', 7], ['fiba-tallyball', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-enfant-en-or', 5]]),
  seance(P(8), 'Plan FIBA n°8', [['fiba-double-pas-etoile', 4], ['fiba-chat-et-souris', 4, pause(1)], ['fiba-dribble-en-slalom', 5], ['fiba-tir-sous-pression', 5], ['fiba-go', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-passer-couper-2c2', 7], ['fiba-jeu-des-points', 7, pause(2)], ['fiba-5-possessions', 10], ['fiba-enfant-en-or', 5]]),
  seance(P(9), 'Plan FIBA n°9', [['fiba-double-pas-etoile', 4], ['fiba-queue-de-tigre', 4, pause(1)], ['fiba-dribble-et-elimination', 5], ['fiba-tir-sous-pression', 5], ['fiba-go', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-passer-couper-2c2', 7], ['fiba-2-contre-1-continu', 7, pause(2)], ['fiba-match-amical', 10], ['fiba-enfant-en-or', 5]]),
  seance(P(10), 'Plan FIBA n°10', [['fiba-double-pas-etoile', 4], ['fiba-passer-et-couper', 4, pause(1)], ['fiba-defendre-les-cercles', 5], ['fiba-tir-sous-pression', 5], ['fiba-go', 4], ['fiba-dribbler-pivoter-passer', 4, pause(2)], ['fiba-passer-couper-2c2', 7], ['fiba-2-contre-1-continu', 7, pause(2)], ['fiba-match-amical', 10], ['fiba-enfant-en-or', 5]]),
]

export const fiba: Paquet = {
  id: 'fiba',
  titre: 'FIBA – Commencer à entraîner',
  description: '30 exercices et les 10 plans d’entraînement d’une heure du livret FIBA pour débuter (jeunes et débutants).',
  credits: `${SOURCE} (© 2020 FIBA-WABC). Schémas redessinés et textes reformulés pour Triple Threat ; usage personnel.`,
  systemes: docs,
  seances,
}
