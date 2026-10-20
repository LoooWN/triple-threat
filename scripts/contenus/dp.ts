// Les plus populaires de chaque catégorie de Drills&Plays (2 par catégorie, sans doublon) :
// schémas redessinés d'après les captures du site, textes réécrits en français.
import { ENTIER, exercice, PANIER_LOIN, systeme, type Paquet } from './dsl.ts'
import type { Point } from '../../src/modele/types.ts'

const r = (v: number) => Math.round(v * 100) / 100
// Capture demi-terrain (760×720, panier en haut) : terrain de 38 à 722 px en largeur, de 38 (fond) à 680 px (ligne médiane).
const d = (x: number, y: number): Point => [r(((y - 38) / 642) * 14), r(((x - 38) / 684) * 15)]
// Capture terrain entier : cadre du terrain en pixels ; le panier de droite devient le panier attaqué, `tourne` retourne la vue.
const cadre = (g: number, h: number, dr: number, b: number, tourne = false) => (x: number, y: number): Point =>
  tourne ? [r(((x - g) / (dr - g)) * 28), r(((b - y) / (b - h)) * 15)] : [r(((dr - x) / (dr - g)) * 28), r(((y - h) / (b - h)) * 15)]
const E = cadre(36, 36, 1116, 610)
const T = cadre(36, 36, 1116, 610, true)
const E2 = cadre(47, 41, 1104, 607)

const src = (slug: string, titre: string, auteur: string) =>
  `Drills&Plays — « ${titre} », ${auteur} (drillsandplays.com/en/playbooks/${slug}). Schéma redessiné, texte réécrit.`

const exercices = [
  // — Dribble —
  exercice({
    id: 'dp-1222', nom: 'Échange de ballons au signal', categorie: 'Dribble', duree: 8,
    source: src('1222-communication-drill', 'Communication drill', 'David E (1 Pixel Army)'),
    miseEnPlace: 'Six joueurs dans le demi-terrain, la moitié avec un ballon. Tout le monde bouge ; les porteurs dribblent sans jamais arrêter le ballon. À chaque « Maintenant ! » de l’entraîneur, chaque porteur donne son ballon à un joueur différent de la fois précédente. Si un ballon s’arrête de rebondir, l’exercice s’arrête et le fautif a un gage.',
    pointsCles: 'Parler : appeler le ballon par le prénom du porteur.\nTête levée pendant le dribble.\nPas d’erreur due à un manque de communication.',
    variantes: 'Version d’origine : chaque joueur a un ballon et l’échange avec un autre au signal.',
  }, { 1: d(60, 300), 2: d(180, 300), 3: d(300, 300), 4: d(460, 300), 5: d(580, 300), 6: d(700, 300), C: d(380, 600) }, ['1', '3', '5'])
    .etape('Tout le monde se déplace ; les porteurs dribblent tête levée.', (a) => a
      .dribble('1', d(150, 470)).coupe('2', d(250, 540)).dribble('3', d(330, 420)).coupe('4', d(470, 420)).dribble('5', d(560, 520)).coupe('6', d(660, 430)))
    .etape('« Maintenant ! » : chaque porteur donne son ballon à un partenaire.', (a) => a
      .passe('1', '2').passe('3', '4').passe('5', '6'))
    .etape('Signal suivant : le ballon part chez un joueur différent.', (a) => a
      .passe('2', '3', d(300, 520)).passe('4', '5', d(540, 440)).passe('6', '1', d(400, 380))),

  exercice({
    id: 'dp-2794', nom: 'Transition 15 paniers en 60 secondes', categorie: 'Échauffement', terrain: ENTIER, duree: 10,
    source: src('2794-transition-drill-15-60', 'Transition Drill 15-60', 'Jacobo Varela Aldao'),
    miseEnPlace: 'Échauffement de début ou de milieu d’entraînement. Un rebondeur sous chaque panier, deux files dans chaque coin. Le rebondeur relance vers un joueur qui se démarque au niveau de la ligne à 3 points ; celui-ci (un dribble maximum) envoie une longue passe au joueur qui court le long de la touche opposée, qui finit au panier. Le passeur file prendre le rebond et relance de l’autre côté. Objectif : 15 paniers en 60 secondes.',
    pointsCles: 'Le rebond ne doit pas toucher le sol ; panier marqué : remise en jeu rapide d’une main depuis la ligne de fond.\nTir raté : on ne repasse pas par la ligne de fond, on protège le ballon et on relance vers un nouveau receveur qui annonce son prénom.\nPasses longues et précises.',
    variantes: 'Finir à droite d’un côté et à gauche de l’autre. Adapter les règles (dribbles, type de finition) au niveau.',
  }, { 3: E2(1025, 270), 1: E2(990, 55), 7: E2(1098, 55), 2: E2(990, 558), 6: E2(1098, 558), 4: E2(55, 55), 8: E2(18, 55), 5: E2(90, 594), 9: E2(18, 594) }, ['3'])
    .etape('3 prend le rebond et relance vers 1 qui se démarque ; 2 sprinte le long de la touche.', (a) => a
      .coupe('1', E2(843, 160)).passe('3', '1').coupe('2', E2(575, 565), E2(305, 487)))
    .etape('1 envoie une longue passe à 2 ; 3 rejoint la file du coin.', (a) => a
      .passe('1', '2').coupe('3', E2(1133, 90)))
    .etape('2 finit au panier ; 1 suit pour prendre le rebond.', (a) => a
      .dribble('2', E2(125, 345)).tir('2', undefined, PANIER_LOIN).coupe('1', E2(575, 250), E2(195, 305)))
    .etape('1 prend le rebond et relance vers 4 ; 5 sprinte le long de l’autre touche.', (a) => a
      .coupe('4', E2(275, 165)).passe('1', '4').coupe('5', E2(575, 590), E2(888, 485)), { ballons: ['1'] })
    .etape('4 envoie la longue passe à 5…', (a) => a.passe('4', '5'))
    .etape('… qui finit de l’autre côté ; 4 suit au rebond et l’exercice continue.', (a) => a
      .dribble('5', E2(1030, 330)).tir('5').coupe('4', E2(575, 300), E2(960, 300))),

  // — Tir —
  exercice({
    id: 'dp-1268', nom: 'Tirs des 4 coins', categorie: 'Tir', terrain: ENTIER, duree: 10,
    source: src('1268-4-corner-shooting', '4-Corner Shooting', 'Javier Roldán'),
    miseEnPlace: 'Une file dans chaque coin du terrain, les deuxièmes de file avec un ballon. Les premiers traversent le terrain en diagonale et reçoivent, à l’aile opposée, la passe du coin le plus proche, puis tirent. Ils prennent leur rebond, ramènent le ballon en dribble vers le coin et deviennent passeurs pour la vague suivante.',
    pointsCles: 'Courir vite en diagonale, mains prêtes à recevoir.\nPasse dans la course, à hauteur de poitrine.\nRéception pieds orientés vers le panier, tir sans dribble.',
    variantes: 'Varier les tirs : 3 points, pénétration et double-pas, tir après un dribble.',
  }, { 1: E(55, 92), 2: E(1097, 92), 3: E(55, 558), 4: E(1097, 558), 5: E(18, 92), 6: E(1135, 92), 7: E(18, 558), 8: E(1135, 558) }, ['5', '6', '7', '8'])
    .etape('Les premiers traversent en diagonale ; les passeurs des coins les servent à l’aile.', (a) => a
      .coupe('1', E(915, 485)).coupe('2', E(235, 487)).coupe('3', E(915, 160)).coupe('4', E(235, 160))
      .passe('5', '4').passe('6', '3').passe('7', '2').passe('8', '1'))
    .etape('Tir après réception ; les passeurs partent à leur tour en diagonale.', (a) => a
      .tir('4', undefined, PANIER_LOIN).tir('2', undefined, PANIER_LOIN).tir('3').tir('1')
      .coupe('5', E(888, 450)).coupe('6', E(265, 450)).coupe('7', E(888, 198)).coupe('8', E(265, 198)))
    .etape('Chaque tireur prend son rebond, ramène le ballon au coin et sert le suivant.', (a) => a
      .dribble('4', E(40, 70)).passe('4', '8').dribble('2', E(40, 580)).passe('2', '6')
      .dribble('3', E(1112, 70)).passe('3', '7').dribble('1', E(1112, 580)).passe('1', '5'),
    { ballons: ['1', '2', '3', '4'], placer: { 4: E(95, 300), 2: E(95, 350), 3: E(1060, 300), 1: E(1060, 350) } }),

  exercice({
    id: 'dp-5890', nom: '3 contre 2 puis 2 contre 1 en continu', categorie: 'Jeu réduit', terrain: ENTIER, duree: 12,
    source: src('5890-3v2-and-2v1-continuous', '3v2 and 2v1 Continuous', 'Juan Knario Deve'),
    miseEnPlace: 'Travail des surnombres. Départ : trois attaquants au milieu du terrain (le porteur au centre, deux ailiers), deux défenseurs à la ligne des lancers francs, deux joueurs hors du terrain le long des touches et un défenseur seul à l’autre panier. On joue 3 contre 2 ; après le panier, un défenseur remet en jeu depuis la ligne de fond à l’autre défenseur, et les deux attaquent l’autre panier à 2 contre 1. Les joueurs des touches entrent pour défendre la vague suivante, le marqueur file derrière la ligne de fond opposée, les autres attaquants vont dans les touches. Puis 3 contre 2 au retour, et ainsi de suite.',
    pointsCles: 'Écartement : trois couloirs, ailiers larges.\nChercher la meilleure solution de tir, pas le premier tir.\nEnchaîner sans temps mort : la remise en jeu est immédiate.',
  }, { 1: T(557, 307), 2: T(557, 125), 3: T(557, 522), 4: T(270, 17), 5: T(270, 630), X1: T(265, 230), X2: T(265, 410), X3: T(880, 335) }, ['1'])
    .etape('3 contre 2 : 1 monte en dribble au centre, 2 et 3 remplissent les ailes ; les défenseurs se placent en tandem.', (a) => a
      .dribble('1', T(380, 307)).coupe('2', T(300, 125)).coupe('3', T(300, 522)).coupe('X1', T(345, 300)).coupe('X2', T(200, 330)))
    .etape('X2 sort sur 2 : 1 trouve 3, libre, qui tire.', (a) => a
      .coupe('X2', T(260, 200)).passe('1', '3').tir('3'))
    .etape('X1 remet en jeu à X2 ; 4 et 5 entrent pour défendre, 3 file derrière la ligne de fond opposée, 1 et 2 vont dans les touches.', (a) => a
      .coupe('X2', T(240, 150)).passe('X1', 'X2').coupe('4', T(270, 240)).coupe('5', T(270, 410))
      .coupe('3', T(700, 600), T(1135, 340)).coupe('1', T(232, 630)).coupe('2', T(232, 17)),
    { ballons: ['X1'], placer: { X1: T(18, 330) } })
    .etape('2 contre 1 vers l’autre panier : X2 fixe X3 et sert X1 qui finit.', (a) => a
      .dribble('X2', T(800, 250)).coupe('X1', T(560, 450), T(900, 430)).coupe('X3', T(900, 300)).passe('X2', 'X1').tir('X1', undefined, PANIER_LOIN)),

  exercice({
    id: 'dp-5613', nom: 'Passes, double-pas russes et tirs', categorie: 'Tir', terrain: ENTIER, duree: 10,
    source: src('5613-passing-russian-layups-and-shooting', 'Passing, Russian layups and shooting', 'Juan Knario Deve'),
    miseEnPlace: 'Six joueurs, deux entraîneurs, trois ballons : trois joueurs par demi-terrain et un entraîneur au cercle des lancers francs de chaque côté. 1 sprinte jusqu’au prolongement de la ligne des lancers francs, reçoit de C1, traverse le terrain en dribble, donne à C2 en arrivant à 45°, puis continue vers le panier où il reçoit la passe de 2 pour finir en double-pas.',
    pointsCles: 'Réception en course, premier dribble vers l’avant.\nPasse à l’entraîneur sans ralentir.\nDouble-pas « russe » : finir après une passe reçue en pleine course.',
    variantes: 'Même enchaînement ensuite vers le panier opposé, en partant de l’autre côté.',
  }, { 1: E(1097, 126), 3: E(1135, 126), 5: E(1062, 342), C1: E(880, 307), C2: E(268, 307), 2: E(55, 126), 4: E(18, 126), 6: E(90, 342) }, ['3', 'C1', '2'])
    .etape('1 sprinte jusqu’au prolongement de la ligne des lancers francs et reçoit de C1.', (a) => a
      .coupe('1', E(878, 126)).passe('C1', '1'))
    .etape('1 traverse en dribble, donne à C2 à 45° et coupe vers le panier ; 2 lui passe.', (a) => a
      .dribble('1', E(560, 140), E(335, 160)).passe('1', 'C2').coupe('1', E(235, 200)).passe('2', '1'))
    .etape('1 finit en double-pas ; 6 prend le rebond.', (a) => a
      .dribble('1', E(125, 268)).tir('1', undefined, PANIER_LOIN).coupe('6', E(110, 300)))
    .etape('Même chose dans l’autre sens : 2 sprinte et reçoit de C2.', (a) => a
      .coupe('2', E(270, 126)).passe('C2', '2')),

  // — Passe —
  exercice({
    id: 'dp-374', nom: 'Roue continue avec porte arrière', categorie: 'Passe', duree: 10,
    source: src('374-continuous-back-door-wheel', 'Continuous Back Door Wheel', 'Javier Roldán'),
    miseEnPlace: 'Une file sous le panier (avec les ballons), une file à chaque aile à 45° et une file en haut. Le joueur sous le panier passe à l’aile gauche et rejoint cette file ; le receveur passe en haut et rejoint la file du haut ; le joueur du haut dribble vers l’aile droite dont le premier joueur coupe en porte arrière et finit sur sa passe. L’entraîneur, à côté du finisseur, joue le défenseur. Le finisseur repart sous le panier avec le ballon.',
    pointsCles: 'Passe à deux mains, sur la main cible.\nPorte arrière : un pas vers le ballon pour fixer le défenseur, puis couper fort dans son dos.\nLe dribbleur passe au moment où le coupeur dépasse le défenseur.',
  }, { 1: d(380, 100), 5: d(380, 20), 2: d(140, 300), 6: d(100, 340), 3: d(380, 460), 7: d(380, 500), 4: d(620, 300), 8: d(660, 340), C1: d(540, 300) }, ['1', '5'])
    .etape('1 passe à l’aile gauche et rejoint cette file.', (a) => a
      .passe('1', '2').coupe('1', d(75, 200), d(60, 420)))
    .etape('2 passe en haut et rejoint la file du haut.', (a) => a
      .passe('2', '3').coupe('2', d(300, 560), d(380, 590)))
    .etape('3 dribble vers l’aile droite ; 4 coupe en porte arrière, reçoit et finit malgré l’entraîneur.', (a) => a
      .dribble('3', d(500, 380)).coupe('4', { c: d(640, 220) }, d(440, 120)).coupe('C1', d(480, 190)).passe('3', '4').tir('4'))
    .etape('4 repart sous le panier avec le ballon ; 5 relance aussitôt vers l’aile gauche.', (a) => a
      .dribble('4', d(440, 25)).passe('5', '6'), { ballons: ['4', '5'] }),

  exercice({
    id: 'dp-720', nom: 'Étoile de passes', categorie: 'Passe', duree: 8,
    source: src('720-passing-star', 'Passing star', 'David E (1 Pixel Army)'),
    miseEnPlace: 'Exercice de début de séance. Quatre files aux quatre coins du demi-terrain, deux ballons au départ (on peut monter à trois). Le porteur passe à la file devant lui, coupe vers le milieu, reçoit en retour puis passe en diagonale vers la file opposée, et rejoint la file à laquelle il a passé.',
    pointsCles: 'Passe et va : ne jamais rester sur place après une passe.\nAppeler le ballon, mains en cible.\nPasses fortes et tendues, sans lob.',
    variantes: 'Ajouter un troisième ballon ; imposer la main faible ; passes à terre.',
  }, { 1: d(620, 580), 6: d(620, 660), 9: d(700, 660), 2: d(100, 140), 5: d(100, 60), 12: d(60, 100), 3: d(140, 580), 7: d(100, 620), 10: d(60, 660), 4: d(620, 140), 8: d(660, 100), 11: d(700, 60) }, ['1', '2'])
    .etape('2 passe à 3 et 1 passe à 4 ; les deux passeurs coupent vers le milieu.', (a) => a
      .passe('2', '3').coupe('2', d(265, 340)).passe('1', '4').coupe('1', d(415, 300)))
    .etape('3 et 4 rendent le ballon.', (a) => a.passe('3', '2').passe('4', '1'))
    .etape('Passes en diagonale vers les files opposées ; chacun rejoint la file où il a passé.', (a) => a
      .passe('2', '6').coupe('2', d(560, 640), d(740, 690)).passe('1', '5').coupe('1', d(200, 80), d(30, 60))),

  // — Appuis et un-contre-un —
  exercice({
    id: 'dp-709', nom: 'Deux 1 contre 1 simultanés en diagonale', categorie: 'Défense', duree: 10,
    source: src('709-double-two-simultaneous-1-on-1s-diagonally', 'Double – Two simultaneous 1-on-1s diagonally', 'Iván González Angullo'),
    miseEnPlace: 'Deux files d’attaquants à 45° derrière la ligne à 3 points, deux files de défenseurs avec ballon sur la ligne de fond. Les défenseurs passent en diagonale à l’attaquant opposé puis courent le défendre (sortie défensive). Deux 1 contre 1 se jouent en même temps. Rotation : celui qui prend le rebond donne le ballon à la file des défenseurs et part dans la file d’attaque opposée ; l’autre rejoint une file de défenseurs.',
    pointsCles: 'Attaquant agressif : défenseur loin, on tire ; défenseur qui arrive trop vite, on pénètre.\nDéfenseur : sortie rapide puis petits pas, bras haut ; s’il y a tir, écran de retrait.\nRegarder aussi l’autre duel : ne pas se gêner.',
  }, { 1: d(180, 420), 3: d(180, 460), 2: d(580, 420), 4: d(580, 460), X1: d(500, 48), X3: d(500, 8), X2: d(260, 48), X4: d(260, 8) }, ['X1', 'X2', 'X3', 'X4'])
    .etape('Les défenseurs passent en diagonale puis courent défendre.', (a) => a
      .passe('X1', '1').coupe('X1', d(255, 345)).passe('X2', '2').coupe('X2', d(500, 300)))
    .etape('1 contre 1 : 1 tire car son défenseur est loin ; 2 pénètre sur une sortie trop rapide.', (a) => a
      .tir('1').coupe('X1', d(230, 330)).dribble('2', d(470, 200)).coupe('X2', d(450, 230)).tir('2')),

  exercice({
    id: 'dp-725', nom: '2 contre 2 des quatre coins', categorie: 'Jeu réduit', duree: 10,
    source: src('725-2x2-four-corners', '2x2 four corners', 'David'),
    miseEnPlace: 'Quatre files : deux sur la ligne de fond (défenseurs), deux à mi-terrain (attaquants). Le ballon part de la première file et circule dans le sens indiqué ; pendant ce temps, les deux défenseurs de la ligne de fond vont défendre les attaquants du côté opposé, et on joue 2 contre 2.',
    pointsCles: 'Défenseurs : arriver vite et bien placés, essayer d’intercepter les passes.\nAttaquants : profiter du retard de la défense.',
    variantes: 'Imposer le type de 2 contre 2 : écran sur le porteur, coupe vers l’intérieur, jeu au poste bas…',
  }, { X1: d(130, 8), X2: d(130, 48), X3: d(610, 8), X4: d(610, 48), 1: d(140, 500), 3: d(140, 540), 2: d(620, 500), 4: d(620, 540) }, ['X2'])
    .etape('Le ballon circule : X2 → X4 → 2 → 1.', (a) => a.passe('X2', 'X4').passe('X4', '2').passe('2', '1'))
    .etape('X2 et X4 croisent pour défendre ; 2 monte poser un écran pour 1.', (a) => a
      .coupe('X2', d(560, 420)).coupe('X4', d(190, 420)).ecran('2', d(300, 430)))
    .etape('2 contre 2 : 1 sort de l’écran en dribble, 2 plonge et reçoit.', (a) => a
      .dribble('1', d(330, 380)).coupe('2', d(400, 160)).passe('1', '2').tir('2')),

  // — Rebond —
  exercice({
    id: 'dp-1279', nom: 'Équilibre défensif à 4 contre 4', categorie: 'Défense', terrain: ENTIER, duree: 12,
    source: src('1279-4vs4-defensive-balance', '4vs4 Defensive Balance', 'Javier Roldán'),
    miseEnPlace: '4 contre 4 sur demi-terrain qui se prolonge en transition. Au moment du tir, deux attaquants vont au rebond offensif et les deux autres repartent aussitôt protéger leur panier (équilibre défensif). Les défenseurs font écran de retrait puis, s’ils récupèrent, attaquent l’autre panier en 4 contre 4.',
    pointsCles: 'Rôles fixés à l’avance : qui va au rebond, qui repart.\nDéfenseurs : contact et écran de retrait avant d’aller chercher le ballon.\nTransition : le premier repli protège le panier, pas le ballon.',
  }, { 1: T(305, 125), 2: T(305, 487), 3: T(90, 594), 4: T(90, 55), X1: T(265, 160), X2: T(265, 410), X3: T(85, 445), X4: T(85, 125) }, ['1'])
    .etape('1 tire : 3 et 4 vont au rebond, 1 et 2 repartent ; les défenseurs font écran de retrait.', (a) => a
      .tir('1').coupe('3', T(90, 400)).coupe('4', T(90, 200)).coupe('1', T(560, 160)).coupe('2', T(560, 450))
      .coupe('X4', T(90, 240)).coupe('X3', T(90, 335)).coupe('X1', T(160, 240)).coupe('X2', T(190, 335)))
    .etape('X3 prend le rebond et relance : 4 contre 4 vers l’autre panier, 1 et 2 sont déjà en place.', (a) => a
      .dribble('X3', T(600, 330), T(850, 305)).coupe('X1', T(920, 125)).coupe('X2', T(990, 520)).coupe('X4', T(1000, 380))
      .coupe('1', T(1000, 260)).coupe('2', T(1020, 420)).coupe('3', T(800, 450)).coupe('4', T(800, 160)),
    { ballons: ['X3'] }),

  // — Condition physique —
  exercice({
    id: 'dp-634', nom: 'Traversées croisées', categorie: 'Physique', terrain: ENTIER, duree: 12,
    source: src('634-opposite-cross-side', 'Opposite Cross Side', 'Jacobo Varela Aldao'),
    miseEnPlace: 'Travail physique avec ballon : passes en course, réceptions, finitions et rebonds. Deux porteurs au moins (1 et 2) sur la ligne de fond ; les autres joueurs sont postés le long des touches au niveau des lancers francs. 1 passe au joueur de touche de son côté, reçoit en entrant sur le terrain, traverse en un dribble maximum par grande poussée, passe au joueur de touche opposé, coupe et reçoit pour finir. Le passeur va au rebond. 2 part dès que 1 a marqué son premier panier.',
    pointsCles: 'Réception en « pas zéro », orienté vers l’avant.\nLe ballon ne touche pas le sol au rebond.\nOn compte les paniers sur un temps donné : tir raté, on retire un point ; ballon perdu, on repart de zéro.',
  }, { 1: E(18, 445), 2: E(18, 487), 3: E(232, 630), 4: E(268, 630), 9: E(197, 17), 10: E(232, 17), 5: E(880, 17), 6: E(918, 17), 7: E(918, 630), 8: E(880, 630) }, ['1', '2'])
    .etape('1 passe à 3 et entre sur le terrain ; 3 lui rend le ballon.', (a) => a
      .passe('1', '3').coupe('1', E(350, 410)).passe('3', '1'))
    .etape('1 traverse en dribble, passe à 5, coupe et reçoit en retour.', (a) => a
      .dribble('1', E(630, 265)).passe('1', '5').coupe('1', E(900, 240)).passe('5', '1'))
    .etape('1 finit ; 5 va au rebond (le ballon ne touche pas le sol).', (a) => a
      .tir('1').coupe('5', E(1050, 300)))
    .etape('5 relance vers 7, qui sert 1 revenu au milieu.', (a) => a
      .passe('5', '7').coupe('1', E(800, 420)).passe('7', '1'), { ballons: ['5', '2'] })
    .etape('1 repart dans l’autre sens, passe à 9, coupe et reçoit.', (a) => a
      .dribble('1', E(520, 300)).passe('1', '9').coupe('1', E(230, 260)).passe('9', '1'))
    .etape('1 finit ; 9 prend le rebond et devient le prochain porteur, 1 va en touche.', (a) => a
      .tir('1', undefined, PANIER_LOIN).coupe('9', E(110, 300))),

  exercice({
    id: 'dp-722', nom: 'Échauffement de finition à haut rythme', categorie: 'Physique', terrain: ENTIER, duree: 10,
    source: src('722-high-pace-finishing-warm-up', 'High-Pace Finishing Warm-Up', 'David E (1 Pixel Army)'),
    miseEnPlace: 'De 5 à plus de 12 joueurs : un joueur à chaque plot (coudes) et des files avec ballon dans les coins. Le joueur du coin sort en un dribble, passe au joueur du plot de l’autre demi-terrain et coupe vers le panier opposé, où le coin lui donne le ballon pour finir. Le passeur du coin court alors de l’autre côté et reçoit du joueur du plot pour recommencer.',
    pointsCles: 'Limiter les dribbles accélère le rythme et travaille la coordination pieds-mains.\nRotation : plot → coin, coin → coupe puis plot (en reprenant son rebond pour le donner au coin).',
    variantes: 'Ajuster le nombre de joueurs par groupe ; imposer la main de finition.',
  }, { 4: E(55, 55), 5: E(18, 17), 3: E(1097, 55), 6: E(1135, 17), 11: E(55, 594), 12: E(18, 630), 9: E(1097, 594), 10: E(1135, 630), 1: E(232, 235), 7: E(232, 413), 2: E(918, 235), 8: E(918, 413) }, ['4', '5', '3', '6', '11', '12', '9', '10'])
    .materiel('plot', E(268, 235), E(268, 413), E(880, 235), E(880, 413))
    .etape('3 et 9 sortent en un dribble, passent aux plots d’en face et coupent vers le panier opposé.', (a) => a
      .dribble('3', E(955, 125)).passe('3', '1').coupe('3', { c: E(560, 80) }, E(125, 235))
      .dribble('9', E(990, 555)).passe('9', '7').coupe('9', { c: E(560, 600) }, E(125, 413)))
    .etape('4 et 11 servent les coupeurs qui finissent, puis partent de l’autre côté et reçoivent des plots.', (a) => a
      .passe('4', '3').tir('3', undefined, PANIER_LOIN).passe('11', '9').tir('9', undefined, PANIER_LOIN)
      .coupe('4', E(345, 125)).passe('1', '4').coupe('11', E(345, 522)).passe('7', '11'))
    .etape('4 et 11 passent aux plots de l’autre côté et coupent vers l’autre panier…', (a) => a
      .passe('4', '2').coupe('4', E(1030, 235)).passe('11', '8').coupe('11', E(1030, 413)))
    .etape('… où les coins (6 et 10) les servent pour finir.', (a) => a
      .passe('6', '4').tir('4').passe('10', '11').tir('11')),

  // — Équipe —
  exercice({
    id: 'dp-3533', nom: 'Roue porte arrière et 1 contre 1', categorie: 'Jeu réduit', duree: 10,
    source: src('3533-backdoor-wheel-one-on-one', 'Backdoor Wheel + One-on-One', 'Ian González'),
    miseEnPlace: 'Trois files : aile gauche (1), aile droite (2), coin droit (3). 1 passe à 2 qui passe à 3. Après sa passe, 2 coupe en porte arrière et file dans le coin opposé, pendant que 1 vient le remplacer à l’aile. 3 donne le ballon au remplaçant et le défend : 1 contre 1 pour travailler les finitions.',
    pointsCles: 'Finitions variées : eurostep, pivot en puissance, ramassé haut.\nLe défenseur sort vite sur le receveur, sans se faire déborder.',
  }, { 1: d(140, 380), 4: d(20, 380), 2: d(660, 340), 5: d(740, 340), 3: d(700, 60), 6: d(740, 20) }, ['1', '4'])
    .materiel('plot', d(180, 340), d(620, 340))
    .etape('1 passe à 2 qui passe à 3 dans le coin.', (a) => a.passe('1', '2').passe('2', '3'))
    .etape('2 coupe en porte arrière jusqu’au coin opposé ; 1 vient le remplacer et reçoit de 3.', (a) => a
      .coupe('2', d(540, 200), d(100, 60)).coupe('1', d(150, 440), d(620, 380)).passe('3', '1'))
    .etape('1 contre 1 : 3 sort défendre, 1 attaque le panier et finit.', (a) => a
      .coupe('3', d(660, 330)).dribble('1', d(470, 300)).tir('1')),

  exercice({
    id: 'dp-2194', nom: 'Concepts en continu sur tout le terrain', categorie: 'Jeu réduit', terrain: ENTIER, duree: 12,
    source: src('2194-continuous-concepts-full-court', 'Continuous Concepts (Full Court)', 'Jacobo Varela Aldao'),
    miseEnPlace: 'Travail des concepts de jeu (écran direct, écran indirect, 1 contre 1) sur les deux demi-terrains en même temps. Passeurs (3 et 4) sur la ligne de fond, receveurs (1 et 2) à mi-terrain, intérieurs (5 et 6) au poste bas côté opposé au ballon. Le receveur reçoit en mouvement à 45° ; l’intérieur monte poser un écran direct de face et ils jouent toutes les situations de l’écran direct. À la fin, les passeurs changent de terrain et deviennent receveurs.',
    pointsCles: 'Recevoir en mouvement, déjà orienté vers le panier.\nL’écran se pose de face, à l’arrêt.\nLire le défenseur : sortir de l’écran, rejeter l’écran, passer au plongeur.',
  }, { 3: E(90, 522), 9: E(18, 487), 4: E(1097, 522), 8: E(1135, 522), 1: E(520, 558), 2: E(630, 558), 5: E(90, 197), 6: E(1062, 197), 7: E(18, 270) }, ['3', '9', '4', '8'])
    .materiel('plot', E(55, 522), E(1097, 487), E(378, 305), E(773, 305), E(90, 235), E(1062, 235))
    .etape('1 et 2 viennent recevoir en mouvement à 45°.', (a) => a
      .coupe('1', E(345, 522)).passe('3', '1').coupe('2', E(845, 522)).passe('4', '2'))
    .etape('5 et 6 montent poser un écran direct de face ; les porteurs en sortent ; 3 et 4 changent de terrain.', (a) => a
      .ecran('5', E(370, 300)).dribble('1', E(300, 268)).ecran('6', E(780, 300)).dribble('2', E(850, 268))
      .coupe('3', E(300, 620), E(600, 560)).coupe('4', E(850, 620), E(520, 560)))
    .etape('Les écranteurs plongent et reçoivent pour finir.', (a) => a
      .coupe('5', E(140, 320)).passe('1', '5').tir('5', undefined, PANIER_LOIN)
      .coupe('6', E(1010, 320)).passe('2', '6').tir('6')),

  exercice({
    id: 'dp-3532', nom: '2 contre 2 en continu sur demi-terrain', categorie: 'Jeu réduit', duree: 12,
    source: src('3532-continuous-2v2-half-court', 'Continuous 2v2 Half Court', 'Ian González'),
    miseEnPlace: 'Deux attaquants contre deux défenseurs, deux joueurs dans les coins du fond (« je suis là ») et deux dans les coins du haut (« je vole »). Après leur attaque, les attaquants doivent défendre sur les joueurs du haut. Les défenseurs filent dans les coins du fond, et les joueurs du fond servent ceux du haut, qui attaquent en 2 contre 2 avec un temps d’avance.',
    pointsCles: 'Enchaîner attaque et repli sans temps mort.\nLes nouveaux attaquants profitent de leur avance pour attaquer vite.',
  }, { 1: d(258, 541), 2: d(460, 541), X1: d(250, 375), X2: d(450, 415), 3: d(60, 60), 4: d(740, 60), 5: d(20, 660), 6: d(700, 660) }, ['1', '4'])
    .materiel('plot', d(340, 541))
    .etape('2 contre 2 : 1 dribble vers l’aile, 2 coupe au panier, reçoit et tire.', (a) => a
      .dribble('1', d(150, 320)).coupe('X1', d(210, 280)).coupe('2', d(460, 175)).coupe('X2', d(420, 230)).passe('1', '2').tir('2'))
    .etape('Après le tir : 4 sert 6 ; X1 et X2 filent dans les coins du fond, 3 et 4 vont dans les coins du haut, 1 et 2 reviennent défendre.', (a) => a
      .passe('4', '6').coupe('4', d(735, 600)).coupe('3', d(60, 600)).coupe('X1', d(70, 70)).coupe('X2', d(690, 70))
      .coupe('5', d(215, 330)).coupe('1', d(270, 330)).coupe('2', d(480, 380)), { ballons: ['4'] })
    .etape('6 attaque avec un temps d’avance et sert 5 ; on enchaîne.', (a) => a
      .dribble('6', d(560, 380)).passe('6', '5').tir('5')),

  exercice({
    id: 'dp-2229', nom: 'Roues de communication (2 extérieurs, 1 intérieur)', categorie: 'Passe', duree: 10,
    source: src('2229-communication-wheels-ii-2-outside-1-inside', 'Communication Wheels II (2 outside – 1 inside)', 'Jacobo Varela Aldao'),
    miseEnPlace: 'Passe à la main et occupation des espaces avec un intérieur, en continu. 1 commence avec deux ballons : il passe le premier à l’intérieur 3, puis donne le second de la main à la main à 2. Après la passe à la main, 1 occupe le côté faible, reçoit de l’intérieur et attaque le panier par la ligne de fond ; l’intérieur se décale (poste moyen ou poste haut). 1 finit ensuite dans un coin sur la passe de 2.',
    pointsCles: 'Passe à la main de face et en mouvement.\nRègles d’espacement : quand on pénètre par la ligne de fond, l’intérieur monte.\nToujours dribbler avec des feintes d’attaque.',
    variantes: 'Passe à la main à l’arrêt après une passe préalable à 2 ; finir par une passe à l’intérieur.',
  }, { 1: d(100, 340), 3: d(260, 140), 2: d(620, 420) }, ['1'])
    .etape('1 donne le premier ballon à 3, à l’intérieur.', (a) => a.passe('1', '3'))
    .etape('Avec le second ballon, 1 dribble vers le haut et le donne de la main à la main à 2.', (a) => a
      .dribble('1', d(330, 490)).coupe('2', d(420, 495)).passe('1', '2'), { ballons: ['1', '3'] })
    .etape('2 dribble vers l’aile gauche ; 1 va occuper le côté faible.', (a) => a
      .dribble('2', d(140, 380)).coupe('1', d(560, 470), d(660, 340)))
    .etape('3 sert 1 côté faible.', (a) => a.passe('3', '1'))
    .etape('1 attaque par la ligne de fond ; 3 monte pour lui laisser l’espace, 1 finit (ou sert 3).', (a) => a
      .dribble('1', d(650, 200), d(420, 100)).coupe('3', d(300, 260), d(385, 215)).tir('1'))
    .etape('1 sort dans le coin et reçoit de 2 pour tirer.', (a) => a
      .coupe('1', d(95, 100)).passe('2', '1').tir('1'), { ballons: ['2'] }),
]

const systemes = [
  // — Demi-terrain —
  systeme({
    id: 'dp-719', nom: 'Série « chin » (attaque Princeton)', categorie: 'Attaque', duree: 10,
    source: src('719-chin-series-example-princeton-offense', 'Chin series example – Princeton offense', 'David E (1 Pixel Army)'),
    miseEnPlace: 'Enchaînement de l’attaque Princeton : un écran dans le dos, puis un écran flare, puis une continuité qui permet de rejouer de l’autre côté pour trouver des tirs près du panier.',
    pointsCles: 'Le passeur à la main sert d’écran.\nL’écran dans le dos se pose au coude, sur le défenseur qui regarde le ballon.\nSi personne n’est libre, la continuité relance la même série côté opposé.',
  }, { 1: d(460, 460), 2: d(220, 420), 3: d(620, 340), 4: d(100, 260), 5: d(500, 140) }, ['1'])
    .etape('1 donne le ballon à la main à 3 et prend sa place ; 2 et 4 échangent ; 5 monte au poste haut.', (a) => a
      .dribble('1', d(540, 410)).coupe('3', d(530, 440)).passe('1', '3').coupe('1', d(580, 340))
      .coupe('2', d(135, 300)).coupe('4', d(180, 420)).coupe('5', d(500, 260)))
    .etape('3 remonte et passe à 4, qui sert 2 ; 5 pose un écran dans le dos et 3 coupe au cercle puis sort dans le coin.', (a) => a
      .dribble('3', d(500, 460)).passe('3', '4').passe('4', '2').ecran('5', d(500, 375))
      .coupe('3', d(540, 330), d(420, 175), d(55, 140)))
    .etape('5 pose un écran flare pour 4, qui coupe au cercle et peut recevoir de 2.', (a) => a
      .ecran('5', d(310, 420)).coupe('4', d(540, 465), d(380, 175)).passe('2', '4').tir('4'))
    .etape('Si 4 n’est pas servi : continuité de l’autre côté (4 ressort à l’aile droite, 1 monte, 2 dribble à gauche, 5 traverse, 3 remonte).', (a) => a
      .coupe('4', d(680, 100), d(620, 340)).coupe('1', d(500, 440)).dribble('2', d(260, 440)).coupe('5', d(280, 260)).coupe('3', d(100, 260)),
    { ballons: ['2'] }),

  systeme({
    id: 'dp-793', nom: 'Remise en jeu rapide « Maccabi »', categorie: 'Remise en jeu', duree: 8,
    source: src('793-fast-blob-maccabi', 'Fast BLOB Maccabi', 'Jacobo Varela Aldao'),
    miseEnPlace: 'Remise en jeu en ligne de fond. Trois joueurs alignés côté ballon à 45°, sans entrer dans la raquette, et un joueur en haut près de la ligne à 3 points.',
    pointsCles: 'Tout part en même temps : la défense doit gérer trois mouvements.\n3 reçoit seul en profitant de l’hésitation sur les changements.',
  }, { 1: d(220, 18), 5: d(260, 100), 4: d(260, 140), 2: d(260, 180), 3: d(420, 460) }, ['1'])
    .etape('5 longe la ligne de fond vers le côté faible, 2 s’écarte à 3 points, 4 pose un écran dans le dos pour 3 qui coupe.', (a) => a
      .coupe('5', d(380, 120), d(545, 140)).coupe('2', d(95, 220)).ecran('4', { c: d(400, 170) }, d(420, 295)).coupe('3', d(425, 330), d(300, 180)))
    .etape('1 sert 3 seul près du panier.', (a) => a.passe('1', '3').tir('3')),

  // — Contre le pressing —
  systeme({
    id: 'dp-690', nom: 'Contre le pressing 2-2-1', categorie: 'Contre le pressing', terrain: ENTIER, duree: 10,
    source: src('690-against-2-2-1-press', 'Against 2-2-1 press', 'David'),
    miseEnPlace: 'Sortie de pressing sur tout le terrain avec beaucoup de circulation de balle : relais au milieu, renversement, puis passe longue derrière la défense.',
    pointsCles: 'Ne pas dribbler dans les pièges : faire circuler.\nLe joueur du milieu (5) est la clé : il reçoit face au jeu.\nAprès la passe longue, sprinter vers le panier.',
  }, { 2: E(18, 413), 1: E(162, 342), 3: E(340, 125), 5: E(413, 342), 4: E(954, 594), X1: E(265, 445), X2: E(300, 230), X3: E(515, 485), X4: E(515, 160), X5: E(805, 450) }, ['2'])
    .etape('2 remet en jeu à 1 et entre sur le terrain ; 3 redescend de l’autre côté.', (a) => a
      .passe('2', '1').coupe('2', E(340, 125)).coupe('3', E(400, 310), E(378, 487)))
    .etape('1 sert 5 au milieu.', (a) => a.passe('1', '5'))
    .etape('5 renverse vers 3.', (a) => a.passe('5', '3'))
    .etape('3 envoie la passe longue à 4 ; 5 sprinte vers la raquette.', (a) => a
      .passe('3', '4').coupe('5', { c: E(650, 380) }, E(888, 342)))
    .etape('4 sert 5 à l’intérieur ; 2 et 3 remontent le terrain.', (a) => a
      .passe('4', '5').tir('5').coupe('2', E(885, 90)).coupe('3', E(780, 522))),

  systeme({
    id: 'dp-526', nom: 'Sortie de pressing tout terrain (Žalgiris)', categorie: 'Contre le pressing', terrain: ENTIER, duree: 10,
    source: src('526-action-against-the-full-court-press-defense', 'Action against the Full-Court Press Defense', 'David E (1 Pixel Army), d’après le Žalgiris Kaunas de Martin Schiller'),
    miseEnPlace: 'Remise en jeu en ligne de fond contre un pressing tout terrain. Deux joueurs aux coudes, deux à mi-terrain le long des touches. Trois passes rapides ramènent le ballon au remetteur lancé au milieu.',
    pointsCles: 'Le remetteur entre aussitôt sur le terrain pour redevenir une solution.\nPasses courtes et sûres, puis attaque au milieu.',
  }, { 1: E(18, 378), 3: E(270, 234), 2: E(270, 413), 5: E(594, 55), 4: E(594, 594) }, ['1'])
    .etape('2 sort recevoir, 4 revient en soutien, 1 entre au milieu : 1 → 2 → 4 → 1.', (a) => a
      .coupe('2', E(162, 522)).passe('1', '2').coupe('1', E(250, 345), E(562, 342))
      .coupe('4', E(500, 575), E(412, 558)).passe('2', '4').passe('4', '1'))
    .etape('1 attaque au milieu en dribble et sert 5 qui coupe au panier.', (a) => a
      .dribble('1', E(745, 342)).coupe('5', { c: E(760, 30) }, E(870, 130), E(995, 235)).passe('1', '5').tir('5')),

  // — Remises en jeu —
  systeme({
    id: 'dp-197', nom: 'Remise en jeu : double-pas rapide ou 3 points', categorie: 'Remise en jeu', duree: 8,
    source: src('197-blob-play-to-get-a-quick-lay-up-or-a-3', 'BLOB play to get a quick lay up or a 3', 'Fernando'),
    miseEnPlace: 'Remise en jeu en ligne de fond. 3, 4 et 5 empilés le long de la raquette côté ballon, 2 dans le coin opposé.',
    pointsCles: 'Première option : 5, qui passe sous le panier.\nDeuxième option : 2, libéré par les deux écrans, pour un 3 points.',
  }, { 1: d(220, 18), 2: d(700, 100), 3: d(260, 180), 4: d(260, 220), 5: d(260, 260) }, ['1'])
    .etape('5 sort du bas de la pile et remonte vers le ballon.', (a) => a
      .coupe('5', d(225, 240), d(225, 135), d(305, 140)))
    .etape('5 traverse sous le panier ; 3 et 4 entrent dans la raquette pour écranter.', (a) => a
      .coupe('5', d(505, 100)).ecran('3', d(340, 180)).ecran('4', d(340, 220)))
    .etape('2 sort du coin par les deux écrans jusqu’à l’aile gauche et reçoit pour tirer.', (a) => a
      .coupe('2', { c: d(660, 230) }, d(380, 215), d(95, 180)).passe('1', '2').tir('2')),

  systeme({
    id: 'dp-5893', nom: 'Remise en jeu en ligne (trois écrans)', categorie: 'Remise en jeu', terrain: ENTIER, duree: 8,
    source: src('5893-linear-for-side-defensive-and-offensive-throw-ins', 'Linear for side, defensive and offensive throw-ins', 'David Granda'),
    miseEnPlace: 'Remise en jeu latérale (en défense comme en attaque). Trois joueurs alignés au milieu ; le dernier est libéré par trois écrans successifs, chacun créant une nouvelle position et des options de passe.',
    pointsCles: 'Utilisable avec le meneur (1) ou un intérieur (4).\nAprès les écrans, les écranteurs s’écartent : solutions de relais.',
  }, { 5: E(557, 630), 1: E(557, 450), 2: E(557, 378), 3: E(557, 305) }, ['5'])
    .etape('1 contourne 2 puis 3, qui écrante, et ressort pour recevoir.', (a) => a
      .ecran('3', E(630, 378)).coupe('1', E(600, 420), E(700, 320), E(447, 125)).passe('5', '1'))
    .etape('2 et 3 s’écartent pour offrir des relais.', (a) => a
      .coupe('2', E(370, 522)).coupe('3', E(740, 522))),

  systeme({
    id: 'dp-5', nom: 'Remise en jeu latérale de Ponsarnau (Spain pick and roll)', categorie: 'Remise en jeu', duree: 10,
    source: src('5-ponsarnau-s-pick-and-roll-sideline', 'Ponsarnau’s pick and roll sideline', 'David E (1 Pixel Army)'),
    miseEnPlace: 'Remise en jeu latérale qui cache jusqu’au dernier moment un « Spain pick and roll » : écran direct pour le porteur et écran dans le dos de l’écranteur.',
    pointsCles: 'Rien ne laisse deviner l’action finale avant la dernière étape.\nL’écran dans le dos (1) arrive au moment où 5 pose l’écran direct.',
  }, { 2: d(20, 380), 1: d(460, 100), 5: d(460, 220), 4: d(340, 260), 3: d(300, 380), X4: d(180, 140), X2: d(180, 300), X5: d(500, 140), X3: d(500, 300), X1: d(340, 380) }, ['2'])
    .etape('4 pose un écran ; 5 en sort pour recevoir loin du panier.', (a) => a
      .ecran('4', d(345, 295)).coupe('5', d(430, 320), d(215, 500)))
    .etape('2 remet à 5 et entre ; 3 file dans le coin gauche.', (a) => a
      .passe('2', '5').coupe('2', d(90, 520), d(220, 580)).coupe('3', d(280, 200), d(55, 100)))
    .etape('5 rend le ballon à 2 et monte au coude ; 4 sort à l’aile gauche.', (a) => a
      .passe('5', '2').coupe('5', d(300, 300)).coupe('4', d(355, 330), d(95, 258)))
    .etape('Spain : 5 pose l’écran direct, 1 monte écranter dans son dos ; 3 longe la ligne de fond, 4 file dans le coin.', (a) => a
      .ecran('5', d(380, 420)).dribble('2', d(380, 520), d(540, 340)).ecran('1', d(330, 180), d(300, 262))
      .coupe('3', d(380, 60), d(625, 60)).coupe('4', d(60, 140)))
    .etape('5 plonge au cercle derrière l’écran de 1 et reçoit ; si l’aide vient, 1 est libre en haut.', (a) => a
      .coupe('5', d(400, 140)).coupe('1', d(380, 430)).passe('2', '5').tir('5')),

  systeme({
    id: 'dp-1000', nom: 'Remise en jeu « Blue »', categorie: 'Fin de match', duree: 6,
    source: src('1000-blue-baseline', 'Blue Baseline', 'Cristian Fabricio Zúñiga Granda'),
    miseEnPlace: 'Remise en jeu en ligne de fond quand il reste peu de secondes, pour un tir de 1. Trois joueurs alignés sur la ligne des lancers francs (3, 1, 5), 2 dans le coin opposé.',
    pointsCles: 'Tout part au signal, en même temps.\n3 coupe au panier pour attirer l’aide.',
  }, { 4: d(500, 18), 2: d(60, 100), 3: d(300, 260), 1: d(380, 260), 5: d(500, 260) }, ['4'])
    .etape('5 écrante pour 1, qui sort près de la ligne de fond ; 3 coupe au panier ; 4 sert 1 qui tire.', (a) => a
      .ecran('5', d(500, 185), d(425, 215)).coupe('1', d(420, 300), d(540, 220)).coupe('3', d(345, 135)).passe('4', '1').tir('1')),

  // — Contre-attaque —
  systeme({
    id: 'dp-2635', nom: 'Relance rapide après panier encaissé', categorie: 'Contre-attaque', terrain: ENTIER, duree: 8,
    source: src('2635-baseline-out-2', 'Baseline out 2', 'Horacio Arigossi Gelvez'),
    miseEnPlace: 'Transition sur tout le terrain après une remise en jeu en ligne de fond, pour exploiter la vitesse. Quatre joueurs alignés à la hauteur des lancers francs.',
    pointsCles: 'Remise en jeu immédiate.\nLes couloirs se remplissent tout de suite : deux ailes, un intérieur qui court au panier.',
  }, { 5: E(18, 197), 4: E(162, 305), 3: E(232, 305), 2: E(305, 305), 1: E(378, 305) }, ['5'])
    .etape('5 remet à 2 qui sort dans le coin, puis entre ; 1 et 4 partent dans les couloirs.', (a) => a
      .coupe('2', E(160, 85)).passe('5', '2').coupe('5', E(385, 197)).coupe('1', E(160, 522)).coupe('4', E(230, 470), E(565, 522)))
    .etape('2 sert 3 au milieu ; tout le monde remonte.', (a) => a
      .passe('2', '3').coupe('5', E(670, 125)).coupe('1', E(420, 522)).coupe('4', E(850, 485)))
    .etape('3 pousse le ballon ; 4 et 5 courent au panier et se croisent, 1 et 2 remplissent les ailes.', (a) => a
      .dribble('3', E(520, 330)).coupe('2', E(600, 125)).coupe('1', E(745, 485))
      .coupe('4', E(1040, 320), E(1060, 85)).coupe('5', E(1040, 330), E(1065, 565))),

  systeme({
    id: 'dp-1144', nom: 'Contre-attaque après rebond', categorie: 'Contre-attaque', terrain: ENTIER, duree: 8,
    source: src('1144-fast-break', 'Fast Break', 'Ruben Mullor'),
    miseEnPlace: 'Séquence offensive sur tout le terrain après un rebond défensif, qui doit finir par un tir près du panier.',
    pointsCles: 'Le rebondeur sort le ballon en dribble vers la touche.\nUn joueur part tout de suite en profondeur.\nLes ailes courent large.',
  }, { 4: E(90, 235), 2: E(197, 235), 1: E(270, 305), 5: E(90, 413), 3: E(197, 413) }, ['4'])
    .etape('4 prend le rebond et sort en dribble ; 2 et 3 écrantent ; 5 et 1 partent en profondeur.', (a) => a
      .dribble('4', E(130, 200), E(380, 90)).ecran('2', E(125, 235)).ecran('3', E(125, 413))
      .coupe('5', E(300, 330), E(780, 90)).coupe('1', E(330, 420), E(560, 570), E(705, 555)))
    .etape('4 sert 1 ; 2 et 3 remontent par le milieu.', (a) => a
      .passe('4', '1').coupe('2', E(635, 268)).coupe('3', E(635, 378)))
    .etape('5 coupe au panier et reçoit de 1 pour finir.', (a) => a
      .coupe('5', E(1025, 268)).passe('1', '5').tir('5')),

  // — Zone —
  systeme({
    id: 'dp-2638', nom: 'Zone 1-2-2 : piège sur le poste bas', categorie: 'Défense', duree: 10,
    source: src('2638-1-2-2-defense-option-pass-to-the-low-post-from-the-corner', '1-2-2 defense, option pass to the low post from the corner', 'José Alfonso Fernández Jiménez'),
    miseEnPlace: 'Défense de zone 1-2-2. L’ailier (X3) prend le porteur en haut ; X1 et X2 forment le haut de la zone, X4 et X5 le bas. Le poste haut est la zone critique : il y a toujours un défenseur devant pour empêcher la réception. Dans cette option, pas de piège dans le coin : on piège à deux le poste bas quand il reçoit.',
    pointsCles: 'Toujours un défenseur devant le poste haut.\nSur la passe au poste bas : 2 contre 1 sur le receveur.\nLes autres se placent en aide et surveillent les lignes de passe.',
  }, { 1: d(380, 460), 2: d(140, 340), 3: d(700, 100), 4: d(380, 300), 5: d(460, 100), X3: d(370, 410), X1: d(490, 290), X2: d(375, 330), X4: d(250, 130), X5: d(490, 130) }, ['1'])
    .etape('1 dribble vers l’aile droite ; X3 le suit, X2 reste devant le poste haut.', (a) => a
      .dribble('1', d(540, 420)).coupe('X3', d(530, 375)).coupe('X1', d(570, 300)).coupe('X2', d(410, 330)))
    .etape('1 passe dans le coin : X5 sort sur 3, X4 glisse sur le poste bas, X2 descend, X3 revient au poste haut.', (a) => a
      .passe('1', '3').coupe('X5', d(650, 105)).coupe('X4', d(470, 140)).coupe('X2', d(380, 215)).coupe('X3', d(460, 300)))
    .etape('3 passe au poste bas : X2 et X4 piègent 5 ; X3 descend dans la raquette, X1 protège le coude.', (a) => a
      .passe('3', '5').coupe('X2', d(410, 92)).coupe('X4', d(455, 130)).coupe('X3', d(330, 175)).coupe('X1', d(490, 250))),

  systeme({
    id: 'dp-5101', nom: 'Attaque contre zone 3-2', categorie: 'Attaque de zone', duree: 10,
    source: src('5101-play-vs-3-2-zone', 'Play vs 3-2 zone', 'Esteban Figueredo'),
    miseEnPlace: 'Attaque placée contre une zone 3-2 : on surcharge un côté, on traverse la zone et on pose un écran sur un défenseur de la zone pour libérer le tireur.',
    pointsCles: 'Se placer dans les trous de la zone.\nL’écran se pose sur le défenseur du fond de la zone.\nLe tireur sort de l’écran face au panier.',
  }, { 1: d(380, 460), 2: d(140, 340), 3: d(620, 340), 4: d(220, 140), 5: d(540, 140), X1: d(370, 410), X2: d(175, 290), X3: d(530, 290), X4: d(255, 130), X5: d(490, 130) }, ['1'])
    .etape('1 passe à 3 ; 5 sort dans le coin droit.', (a) => a
      .passe('1', '3').coupe('5', d(660, 140)).coupe('X3', d(570, 320)))
    .etape('3 sert 5 dans le coin et traverse la zone jusqu’au panier ; 4 se présente dans la raquette, 1 glisse à l’aile.', (a) => a
      .passe('3', '5').coupe('3', d(560, 280), d(380, 100)).coupe('4', d(385, 180)).coupe('1', d(625, 420))
      .coupe('X2', d(300, 300)).coupe('X5', d(580, 130)).coupe('X1', d(430, 340)))
    .etape('5 sert 1 ; 3 longe la ligne de fond jusqu’au coin, 5 écrante le défenseur du fond, 4 monte au poste haut, 2 s’écarte.', (a) => a
      .passe('5', '1').ecran('5', d(585, 180)).coupe('3', d(665, 100)).coupe('4', d(420, 260)).coupe('2', d(100, 260)))
    .etape('1 sert 3 dans le coin.', (a) => a.passe('1', '3'))
    .etape('3 sort de l’écran en dribble et tire au coude ; 5 plonge en deuxième option.', (a) => a
      .dribble('3', d(650, 230), d(540, 220)).coupe('5', d(620, 140)).tir('3')),

  // — Fin de match —
  systeme({
    id: 'dp-794', nom: 'Système « Libertadores »', categorie: 'Fin de match', duree: 10,
    source: src('794-libertadores-play-from-queretaro-draw', 'Libertadores Play from Querétaro Draw', 'David'),
    miseEnPlace: 'Système de fin de match de l’équipe des Libertadores de Querétaro (entraîneur Iván Déniz). Placement 1-4 haut : 3 et 5 aux coudes, 2 et 4 sur les ailes.',
    pointsCles: 'Enchaînement d’actions : passe à la main, écran pour l’ailier, renversement, écran vers le bas.\nLe tireur reçoit en haut, face au panier.',
  }, { 1: d(260, 580), 2: d(140, 340), 3: d(300, 300), 5: d(500, 300), 4: d(660, 300) }, ['1'])
    .etape('1 dribble vers 2 et lui donne le ballon de la main à la main ; 4 remonte vers la ligne de fond.', (a) => a
      .dribble('1', d(300, 520), d(220, 385)).passe('1', '2').coupe('4', d(660, 175)))
    .etape('1 file dans le coin gauche ; 5 écrante pour 4 qui revient en haut à droite.', (a) => a
      .coupe('1', d(95, 135)).ecran('5', d(575, 335), d(580, 265)).coupe('4', d(600, 320), d(540, 380)))
    .etape('2 renverse vers 4 ; 3 descend dans la raquette.', (a) => a
      .passe('2', '4').coupe('3', d(300, 190), d(255, 180)))
    .etape('2 pose un écran vers le bas pour 3, qui remonte en haut, reçoit de 4 et tire.', (a) => a
      .ecran('2', d(250, 380), d(300, 262)).coupe('3', d(258, 420)).passe('4', '3').tir('3')),

  systeme({
    id: 'dp-1661', nom: 'Remise en jeu latérale rapide', categorie: 'Fin de match', duree: 10,
    source: src('1661-fast-slob', 'Fast SLOB', 'Horacio Arigossi'),
    miseEnPlace: 'Remise en jeu latérale qui génère des tirs proches du panier et des coupes. 4 et 5 restent fixes en haut pendant que 3 traverse pour recevoir.',
    pointsCles: '3 coupe au ras de 4 et 5 pour se démarquer.\nLe remetteur redevient porteur dès la première passe.\nFinir par une coupe au panier sur l’écran de 4.',
  }, { 1: d(740, 460), 2: d(660, 340), 3: d(100, 300), 4: d(260, 380), 5: d(500, 380) }, ['1'])
    .etape('3 traverse en passant entre 4 et 5 pour recevoir ; 2 s’écarte dans le coin.', (a) => a
      .coupe('3', d(250, 430), d(625, 460)).coupe('2', d(705, 135)))
    .etape('1 sert 3 et entre derrière lui ; 4 plonge dans la raquette, 5 monte en haut.', (a) => a
      .passe('1', '3').coupe('1', d(705, 420), d(615, 500)).coupe('4', d(460, 140)).coupe('5', d(380, 420)))
    .etape('3 rend le ballon à 1 ; 2 longe la ligne de fond par l’écran de 4 jusqu’à l’aile gauche.', (a) => a
      .passe('3', '1').ecran('4', d(470, 130)).coupe('2', d(560, 110), d(175, 180)))
    .etape('1 dribble vers la gauche et sert 2 ; 4 ressort à l’aile droite.', (a) => a
      .dribble('1', d(260, 420)).passe('1', '2').coupe('4', d(580, 380)))
    .etape('1 coupe autour de 5 ; 3 coupe au panier par l’écran de 4 et reçoit de 2.', (a) => a
      .coupe('1', d(420, 465), d(380, 295)).coupe('3', d(620, 400), d(495, 175)).passe('2', '3').tir('3')),
]

export const dp: Paquet = {
  id: 'drills-and-plays',
  titre: 'Drills&Plays – les plus populaires',
  description: '16 exercices et 14 systèmes parmi les plus consultés de chaque catégorie de Drills&Plays (tir, passe, défense, remises en jeu, pressing, zone, fin de match…).',
  credits: 'Drills&Plays (drillsandplays.com), contenus publics de leurs auteurs (cités sur chaque fiche). Schémas redessinés et textes réécrits pour Triple Threat ; usage personnel.',
  systemes: [...exercices, ...systemes].map((x) => x.fin()),
  seances: [],
}
