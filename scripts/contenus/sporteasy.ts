// Les 10 fiches d'entraînement basket de SportEasy : schémas dessinés d'après le texte des fiches
// (et d'après le PDF pour « Se démarquer sur l'extérieur », le seul publié), textes réécrits.
import { DEMI, ENTIER, exercice, PANIER_LOIN, type Paquet } from './dsl.ts'
import type { Point } from '../../src/modele/types.ts'

const src = (titre: string, slug: string) =>
  `SportEasy — fiche « ${titre} » (sporteasy.net/fr/blog/fiches-seances-entrainement/exercices-basket/${slug}/). Schéma redessiné, texte réécrit.`

// Placement commun aux deux fiches sur l'écran sortant : 1 et 2 en haut, 3 et 4 sur les ailes, 5 sous le panier.
const ECRAN: Record<string, Point> = { 1: [8.8, 5.0], 2: [8.8, 10.0], 3: [5.2, 13.0], 4: [5.2, 2.0], 5: [0.4, 7.5] }

const exercices = [
  exercice({
    id: 'se-demarquer-exterieur', nom: 'Se démarquer sur l’extérieur', categorie: 'Passe', duree: 30,
    source: src('Se démarquer sur l’extérieur', 'fiche-dentrainement-basket-demarquer-exterieur'),
    miseEnPlace: 'Demi-terrain, de 4 à 8 joueurs, 2 ballons, 8 plots. Deux paires meneur + arrière, une de chaque côté de la raquette ; deux plots de chaque côté à l’extérieur de la raquette et deux plots dans la raquette. Un défenseur sur l’arrière si l’effectif le permet. L’arrière fait un aller-retour entre ses plots, vient demander la balle en se démarquant, reçoit du meneur et doit tirer avant les plots de la raquette ; s’il rate, il reprend jusqu’à marquer. Puis meneur et arrière échangent leurs rôles et changent de côté.',
    pointsCles: 'Passes précises, dans la zone de réception.\nL’arrière demande la balle et change de rythme dans son appel, comme en match.\nAvec un défenseur, l’emmener dans la mauvaise direction avant de partir.',
  }, { 1: [10.8, 5.6], 3: [10.8, 9.4], 2: [5.8, 4.6], 4: [5.8, 10.4], X2: [5.0, 3.6], X4: [5.0, 11.4] }, ['1', '3'])
    .materiel('plot', [5.8, 5.6], [5.8, 9.4], [2.6, 5.4], [2.6, 9.6], [7.2, 1.6], [7.2, 13.4], [4.2, 0.6], [4.2, 14.4])
    .etape('L’arrière fait un aller-retour vers le plot de la raquette.', (a) => a
      .coupe('2', [2.9, 5.0], [5.6, 4.2]).coupe('4', [2.9, 10.0], [5.6, 10.8]))
    .etape('Appel avec changement de rythme vers l’extérieur ; le meneur passe.', (a) => a
      .coupe('2', [7.4, 2.4]).coupe('X2', [6.6, 3.2]).passe('1', '2').coupe('4', [7.4, 12.6]).coupe('X4', [6.6, 11.8]).passe('3', '4'))
    .etape('Tir avant les plots de la raquette.', (a) => a
      .dribble('2', [4.6, 4.4]).tir('2').dribble('4', [4.6, 10.6]).tir('4')),

  exercice({
    id: 'se-defendre-ecran', nom: 'Défendre l’écran sortant', categorie: 'Défense', duree: 18,
    source: src('Défendre l’écran', 'fiche-basket-defendre-lecran'),
    miseEnPlace: 'Cinq joueurs placés en haut (1 et 2), sur les ailes (3 et 4) et sous le panier (5) ; le ballon part de 1. Le ballon circule dans l’ordre. Les deux premiers passeurs vont défendre sur le joueur placé dans leur diagonale. 3 passe et va, puis ressort grâce à l’écran sortant de l’intérieur au poste bas. 5 monte pendant la passe de 3 à 4, reçoit de 4 et joue le rôle de meneur : 2 contre 2 + passeur.',
    pointsCles: 'Défenseur de l’ailier : suivre au contact, ne pas se faire enfermer dans l’écran.\nDéfenseur de l’écranteur : annoncer l’écran et aider.\nRotation (joueurs polyvalents) : 1 prend la place de 2, 2 celle de 3, et ainsi de suite, 5 celle de 1. Joueurs spécialisés : 1 et 3, 2 et 4 inversent leurs rôles.',
  }, { ...ECRAN }, ['1'])
    .etape('1 passe à 2 et va défendre sur 3, dans sa diagonale.', (a) => a.passe('1', '2').coupe('1', [6.2, 12.0]))
    .etape('2 passe à 3 et va défendre sur 4.', (a) => a.passe('2', '3').coupe('2', [6.2, 3.0]))
    .etape('3 passe à 4 et coupe vers le panier ; 5 monte en haut.', (a) => a
      .passe('3', '4').coupe('3', [1.6, 8.6]).coupe('1', [2.4, 9.4]).coupe('5', [8.8, 7.5]))
    .etape('4 passe à 5 et descend poser l’écran sortant au poste bas ; 3 en sort vers l’aile et reçoit de 5.', (a) => a
      .passe('4', '5').ecran('4', [2.2, 3.4]).coupe('2', [3.2, 3.0]).coupe('3', [1.4, 5.0], [5.0, 1.8]).coupe('1', [3.2, 4.8]).passe('5', '3'))
    .etape('2 contre 2 + passeur : 3 attaque son défenseur.', (a) => a.dribble('3', [3.4, 4.8]).tir('3')),

  exercice({
    id: 'se-lire-reaction-defensive', nom: 'Lire la réaction défensive sur l’écran', categorie: 'Jeu réduit', duree: 18,
    source: src('Lire la réaction défensive', 'fiche-basket-lire-la-reaction-defensive'),
    miseEnPlace: 'Même placement que « Défendre l’écran sortant ». Le ballon circule dans l’ordre ; les deux premiers passeurs défendent sur leur vis-à-vis en diagonale. 3 passe et va, puis reste au poste bas opposé pour profiter de l’écran de son partenaire. 5 monte pendant la passe de 3 à 4, reçoit de 4 et se décale en dribble pour déclencher l’écran entre les intérieurs : 2 contre 2 + passeur.',
    pointsCles: 'L’attaquant lit la défense : défenseur qui passe dessus, en dessous ou qui reste dans l’écran, la réponse change.\nVarier les choix défensifs à chaque passage.\nRotation : 1 prend la place de 2, 2 celle de 3, 3 celle de 4, 4 celle de 5, 5 celle de 1.',
  }, { ...ECRAN }, ['1'])
    .etape('1 passe à 2 et va défendre sur 3 ; 2 passe à 3 et va défendre sur 4.', (a) => a
      .passe('1', '2').coupe('1', [6.2, 12.0]).passe('2', '3').coupe('2', [6.2, 3.0]))
    .etape('3 passe à 4 et file au poste bas opposé ; 5 monte en haut.', (a) => a
      .passe('3', '4').coupe('3', [2.2, 10.2]).coupe('1', [2.8, 9.4]).coupe('5', [8.8, 7.5]))
    .etape('4 passe à 5 et descend au poste bas ; 5 se décale en dribble ; 4 écrante pour 3 qui traverse et reçoit.', (a) => a
      .passe('4', '5').coupe('4', [2.2, 4.2]).coupe('2', [3.0, 3.6]).dribble('5', [8.4, 4.4])
      .ecran('4', [2.0, 6.4]).coupe('3', [1.4, 7.6], [2.4, 4.4]).coupe('1', [2.0, 8.8]).passe('5', '3'))
    .etape('3 attaque selon le choix du défenseur (dessus, dessous ou dans l’écran).', (a) => a.tir('3')),

  exercice({
    id: 'se-dissocier-haut-bas', nom: 'Dissocier le haut et le bas du corps', categorie: 'Passe', terrain: ENTIER, duree: 22,
    source: src('Dissocier le haut et le bas du corps', 'fiche-basket-dissocier-haut-bas-corps'),
    miseEnPlace: 'Tout le terrain, 4 colonnes sur chaque ligne de fond, un ballon par joueur sauf pour les deux joueurs du milieu de la première vague. Les latéraux remontent le terrain en passes avec les joueurs du milieu, qui leur rendent le ballon à tour de rôle et se croisent après chaque réception-passe. Au bout, les latéraux tirent ; les joueurs du milieu reçoivent des deux joueurs centraux de la vague suivante et tirent. Les 4 tireurs prennent leur rebond et échangent positions centrales et latérales. La vague suivante part dès que les 4 sont prêts.',
    pointsCles: 'Appuis toujours orientés dans le sens du déplacement.\nLe haut du corps tourné vers le passeur ou le receveur.\nDissocier la vitesse des bras de celle des jambes.',
  }, { 1: [28.4, 1.5], 2: [28.4, 5.5], 3: [28.4, 9.5], 4: [28.4, 13.5], 5: [-0.4, 1.5], 6: [-0.4, 5.5], 7: [-0.4, 9.5], 8: [-0.4, 13.5] }, ['1', '4', '5', '6', '7', '8'])
    .etape('Départ : les latéraux passent aux joueurs du milieu, tout le monde court.', (a) => a
      .coupe('2', [22, 5.5]).coupe('3', [22, 9.5]).passe('1', '2').coupe('1', [22, 1.5]).passe('4', '3').coupe('4', [22, 13.5]))
    .etape('Les joueurs du milieu rendent le ballon et se croisent.', (a) => a
      .coupe('1', [14, 1.5]).coupe('4', [14, 13.5]).passe('2', '1').coupe('2', [14, 9.5]).passe('3', '4').coupe('3', [14, 5.5]))
    .etape('Au bout : les latéraux tirent ; les joueurs du milieu reçoivent de 6 et 7 et tirent.', (a) => a
      .dribble('1', [4.6, 2.6]).tir('1').dribble('4', [4.6, 12.4]).tir('4')
      .coupe('2', [3.6, 9.2]).coupe('3', [3.6, 5.8]).passe('7', '2').passe('6', '3').tir('2').tir('3')),

  exercice({
    id: 'se-tir-sous-pression', nom: 'Tir sous pression', categorie: 'Tir', terrain: ENTIER, duree: 18,
    source: src('Le tir sous pression', 'fiche-basket-le-tir-sous-pression'),
    miseEnPlace: 'Deux colonnes, l’une avec les ballons. Exercice 1 : A (en dribble) et B (en courant) vont chacun poser un pied dans le rond central ; A passe à B, qui doit marquer le plus vite possible sur l’un des paniers pendant que A court toucher le filet ou le cercle de l’autre panier. Exercice 2 : A va tirer en course sur le panier de son choix, B le poursuit et essaie de gêner le tir.',
    pointsCles: 'Pression du temps, de l’adversaire et de l’enjeu : rester lucide.\nFinir vite mais propre, sans se précipiter au dernier pas.',
  }, { 1: [13.2, 15.4], 3: [13.2, 16.0], 2: [14.8, 15.4], 4: [14.8, 16.0] }, ['1', '3'])
    .etape('A (1) en dribble et B (2) en courant posent un pied dans le rond central ; A passe à B.', (a) => a
      .dribble('1', [13.4, 8.4]).coupe('2', [14.6, 8.4]).passe('1', '2'))
    .etape('B file marquer ; A sprinte toucher le filet de l’autre panier.', (a) => a
      .dribble('2', [3.2, 6.8]).tir('2').coupe('1', [25.8, 7.5]))
    .etape('Exercice 2 : A tire en course sur le panier de son choix, B le poursuit pour gêner le tir.', (a) => a
      .dribble('1', [3.2, 6.6]).tir('1').coupe('2', [3.8, 7.6]),
    { ballons: ['1'], placer: { 1: [13.4, 8.4], 2: [14.6, 8.4] } }),

  exercice({
    id: 'se-sortie-de-balle', nom: 'Sortie de balle et finition de contre-attaque', categorie: 'Jeu réduit', terrain: ENTIER, duree: 15,
    source: src('Perfectionner la sortie de balle et la finition de la contre-attaque', 'fiche-basket-perfectionner-sortie-balle-finition-contre-attaque'),
    miseEnPlace: 'Tout le terrain, 7 joueurs, un ballon par groupe. Une vague de trois (meneur et deux ailiers) en zone arrière, le ballon à un ailier ; un défenseur en zone avant ; la vague suivante attend. La vague remonte en passes jusqu’à la ligne médiane, puis le meneur fixe le défenseur et passe à un ailier qui marque. Ensuite, l’ailier qui a tiré défend sur le défenseur, qui devient meneur ; l’autre ailier remet en jeu et prend le couloir opposé ; le nouveau meneur dirige la contre-attaque et l’ailier prolonge vers l’ailier de la vague suivante.',
    pointsCles: 'Le porteur évite le contact du défenseur en choisissant la bonne passe.\nL’ailier améliore la ligne de passe ; si la passe directe est contestée, chercher le triangle.\nLe tireur passe tout de suite d’attaquant à défenseur.',
  }, { 2: [26.6, 13.2], 1: [24.2, 7.5], 3: [26.6, 1.8], 4: [28.4, 13.2], 5: [28.4, 1.8], 6: [28.4, 7.5], X1: [6.2, 7.5] }, ['2'])
    .etape('2 sort le ballon vers le meneur ; la vague remonte.', (a) => a
      .coupe('1', [15, 7.5]).passe('2', '1').coupe('2', [15, 13]).coupe('3', [15, 2]))
    .etape('1 fixe le défenseur et sert 3, qui marque.', (a) => a
      .dribble('1', [6.8, 7.5]).coupe('X1', [5.6, 7.2]).coupe('3', [3.4, 2.6]).coupe('2', [3.4, 12.4]).passe('1', '3').tir('3'))
    .etape('2 remet en jeu au défenseur, qui devient meneur, et part dans le couloir opposé ; 3 défend sur lui.', (a) => a
      .passe('2', 'X1').coupe('2', [8, 1.6], [14, 2]).coupe('3', [5, 6.4]), { ballons: ['2'], placer: { 2: [-0.4, 9] } })
    .etape('Le meneur dirige la contre-attaque et sert 2, qui prolonge vers l’ailier de la vague suivante.', (a) => a
      .dribble('X1', [13, 7.5]).coupe('3', [12, 8.2]).passe('X1', '2').coupe('5', [23, 2]).passe('2', '5')),

  exercice({
    id: 'se-retarder-contre-attaque', nom: 'Retarder une contre-attaque', categorie: 'Défense', terrain: ENTIER, duree: 15,
    source: src('Retarder une contre-attaque', 'fiche-basket-retarder-contre-attaque'),
    miseEnPlace: 'Tout le terrain, 4 contre 4, un ballon. L’entraîneur donne un numéro à chaque joueur. À chaque tir, il annonce un numéro : ce joueur doit aller toucher la ligne de fond avant de revenir défendre. Ses coéquipiers doivent retarder la contre-attaque à 3 contre 4 pour lui laisser le temps de revenir. En continu jusqu’à 10 points, puis jusqu’à 16.',
    pointsCles: 'Toujours un défenseur qui stoppe le porteur.\nLes autres sur les joueurs les plus avancés, avec ou sans ballon, sur les lignes de passe.\nEn zone dangereuse, créer l’incertitude pour provoquer un mauvais choix.',
    variantes: 'Autoriser l’équipe en surnombre à repasser en attaque placée.',
  }, { 1: [7.6, 7.5], 2: [5.6, 2.4], 3: [5.6, 12.6], 4: [2.4, 9.6], X1: [6.6, 7.4], X2: [4.9, 3.1], X3: [4.9, 11.9], X4: [2.1, 8.6], C: [12, 15.6] }, ['1'])
    .etape('1 tire ; l’entraîneur annonce « 1 ! ».', (a) => a.tir('1').texte([12, 13.6], '« 1 ! »'))
    .etape('X4 prend le rebond et relance ; 1 va toucher la ligne de fond ; 2, 3 et 4 retardent la contre-attaque.', (a) => a
      .coupe('X1', [9, 7.4]).passe('X4', 'X1').coupe('X2', [18, 2.2]).coupe('X3', [18, 12.8])
      .coupe('1', [-0.3, 7.5], [9.5, 6.4]).coupe('2', [11.5, 6.6]).coupe('3', [17, 11.6]).coupe('4', [20, 7.5]), { ballons: ['X4'] })
    .etape('2 freine le porteur, 3 et 4 tiennent les plus avancés : 1 revient à temps, on joue à égalité.', (a) => a
      .dribble('X1', [16, 7]).coupe('2', [17, 6.6]).coupe('X4', [14, 10]).coupe('X2', [24, 2.6]).coupe('X3', [24, 12.4])
      .coupe('3', [23.4, 11.4]).coupe('4', [24.6, 4.6]).coupe('1', [22, 8.4])),

  exercice({
    id: 'se-tir-suspension-course', nom: 'Tir en suspension après une course', categorie: 'Tir', terrain: ENTIER, duree: 22,
    source: src('Travailler le tir en suspension après course', 'fiche-basket-tir-en-suspension-apres-course'),
    miseEnPlace: 'Tout le terrain, 6 colonnes : trois sur chaque ligne de fond. Tous les joueurs ont un ballon sauf les deux ailiers de la première vague (2 et 3). La vague remonte en passes jusqu’à la ligne médiane ; le joueur central (1) garde le ballon, dribble jusqu’à la ligne des lancers francs et tire en suspension. Les ailiers continuent dans leur couloir et piquent vers le panier à hauteur des lancers francs : les joueurs du même couloir sur l’autre ligne de fond (7 et 9) leur lancent un ballon pour un tir en suspension. Les trois tireurs vont au rebond et prennent la place de 7, 8 et 9, qui repartent dans l’autre sens.',
    pointsCles: 'Appuis orientés vers la cible à la réception.\nUn dernier dribble très puissant avant de s’élever.\nNe pas redescendre le ballon : armer le tir depuis la réception, malgré la fatigue.',
  }, { 2: [28.4, 2], 1: [28.4, 7.5], 3: [28.4, 13], 7: [-0.4, 2], 8: [-0.4, 7.5], 9: [-0.4, 13] }, ['1', '7', '8', '9'])
    .etape('La vague remonte en passes jusqu’à la ligne médiane : 1 → 2 → 3 → 1.', (a) => a
      .coupe('2', [14.5, 2]).coupe('3', [14.5, 13]).passe('1', '2').coupe('1', [14.5, 7.5]).passe('2', '3').passe('3', '1'))
    .etape('1 dribble jusqu’aux lancers francs et tire ; 2 et 3 piquent vers le panier, reçoivent de 7 et 9 et tirent.', (a) => a
      .dribble('1', [6.2, 7.5]).tir('1').coupe('2', [6, 2], [3.6, 4]).coupe('3', [6, 13], [3.6, 11])
      .passe('7', '2').passe('9', '3').tir('2').tir('3'))
    .etape('Les tireurs vont au rebond et prennent la place de 7, 8 et 9, qui repartent dans l’autre sens.', (a) => a
      .coupe('1', [-0.4, 8.2]).coupe('2', [-0.4, 2.7]).coupe('3', [-0.4, 13.7])
      .coupe('7', [12, 2]).dribble('8', [12, 7.5]).coupe('9', [12, 13]), { ballons: ['8'] }),

  exercice({
    id: 'se-rebond-offensif', nom: 'Le suiveur au rebond offensif', categorie: 'Rebond', terrain: DEMI, duree: 20,
    source: src('Travailler le rebond offensif', 'fiche-basket-travailler-le-rebond-offensif'),
    miseEnPlace: 'Trois colonnes : une derrière la planche, deux aux intersections de la raquette et de la ligne de fond. Deux plots à l’extérieur de la ligne à 3 points, dans le prolongement de la ligne des lancers francs. La vague avance de deux pas ; le joueur central lance le ballon devant lui ; les deux latéraux contournent leur plot et se disputent le ballon : celui qui l’attrape attaque, l’autre défend, et le joueur central devient le suiveur. L’attaquant tire de loin ; le suiveur prend le rebond avant que le ballon touche le sol et marque.',
    pointsCles: 'Le suiveur règle sa course sur celle de l’attaquant.\nIl ne le gêne pas et se place à l’opposé du ballon.\nRebond pris haut, avant le sol.',
  }, { 1: [-0.4, 7.5], 4: [-1.0, 7.5], 2: [0.2, 5.0], 5: [-0.4, 5.0], 3: [0.2, 10.0], 6: [-0.4, 10.0] }, ['1'])
    .materiel('plot', [5.8, 1.2], [5.8, 13.8])
    .etape('La vague avance ; 1 lance le ballon devant lui ; 2 et 3 contournent leur plot et se le disputent.', (a) => a
      .tir('1', undefined, [8.6, 7.5]).coupe('2', [1.6, 4.8], [5.8, 0.6], [8.2, 6.8]).coupe('3', [1.6, 10.2], [5.8, 14.4], [8.8, 8.3]))
    .etape('2 a gagné le ballon et tire de loin, 3 défend ; 1 suit à l’opposé du ballon.', (a) => a
      .coupe('3', [7.4, 7.0]).tir('2').coupe('1', [3.6, 9.6]), { ballons: ['2'] })
    .etape('1 prend le rebond avant le sol et marque.', (a) => a.dribble('1', [2.2, 8.6]).tir('1'), { ballons: ['1'] }),

  exercice({
    id: 'se-vitesse-reaction', nom: 'Vitesse de réaction et de déplacement', categorie: 'Physique', terrain: ENTIER, duree: 30,
    source: src('Travailler la vitesse de réaction et de déplacement', 'fiche-basket-vitesse-de-reaction-et-de-deplacement'),
    miseEnPlace: 'Deux colonnes derrière la ligne de fond, deux plots entre la ligne des lancers francs et la ligne médiane, un ballon posé sur chaque plot. 1er signal : sprint jusqu’au bout de la ligne des lancers francs, puis 5 secondes de pas rapides sur place. 2e signal : sprint jusqu’à la ligne de fond, puis jusqu’au plot ; on prend le ballon et on va tirer en course sur l’autre panier, 3 dribbles maximum. 4 répétitions en changeant de colonne.',
    pointsCles: 'Réagir au signal, premiers appuis explosifs.\nRalentir juste assez pour ramasser le ballon proprement.',
    variantes: 'Deux séries de 4 enchaînements séparées par 6 minutes de récupération. Remplacer le tir en course par un tir en suspension.',
  }, { 1: [-0.4, 5.5], 3: [-1.0, 5.5], 2: [-0.4, 9.5], 4: [-1.0, 9.5], C: [3, 15.6] })
    .materiel('plot', [10, 5.5], [10, 9.5])
    .materiel('ballon', [10.4, 5.5], [10.4, 9.5])
    .etape('1er signal : sprint jusqu’au bout de la ligne des lancers francs, puis 5 s de pas rapides sur place.', (a) => a
      .coupe('1', [5.8, 5.05]).coupe('2', [5.8, 9.95]).texte([7.4, 7.5], '5 s sur place'))
    .etape('2e signal : sprint jusqu’à la ligne de fond, puis jusqu’au plot.', (a) => a
      .coupe('1', [0.2, 5.3], [9.6, 5.5]).coupe('2', [0.2, 9.7], [9.6, 9.5]))
    .etape('Ballon ramassé : tir en course sur l’autre panier, 3 dribbles maximum.', (a) => a
      .dribble('1', [25.4, 6.8]).tir('1', undefined, PANIER_LOIN).dribble('2', [25.4, 8.2]).tir('2', undefined, PANIER_LOIN),
    { ballons: ['1', '2'] }),
]

export const sporteasy: Paquet = {
  id: 'sporteasy',
  titre: 'SportEasy – fiches basket',
  description: 'Les 10 fiches d’entraînement basket de SportEasy : démarquage, écrans, tir sous pression, contre-attaque, rebond offensif, vitesse.',
  credits: 'SportEasy (sporteasy.net), fiches d’entraînement gratuites. Schémas redessinés et textes réécrits pour Triple Threat ; usage personnel.',
  systemes: exercices.map((x) => x.fin()),
  seances: [],
}
