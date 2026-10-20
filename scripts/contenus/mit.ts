// 24 systèmes d'attaque d'après 3d-hoops-playbook (HPotty36, licence MIT) : géométrie convertie (mit-geo.ts),
// textes traduits et adaptés en français. Attaque seulement : les défenseurs sont évoqués dans le texte.
import { readFileSync } from 'node:fs'
import { systeme, type Actions, type Paquet } from './dsl.ts'
import { MIT, type Op } from './mit-geo.ts'
import type { Point } from '../../src/modele/types.ts'

interface Fiche { nom: string; miseEnPlace: string; pointsCles: string; quand: string; etapes: string[] }

const FICHES: Record<string, Fiche> = {
  'pick-and-roll': {
    nom: 'Pick and roll',
    miseEnPlace: 'L’action à deux la plus jouée au monde. Un intérieur pose un écran sur le défenseur du porteur ; le porteur attaque en sortant de l’écran et l’écranteur plonge vers le panier. Deux défenseurs doivent arrêter deux attaquants en même temps.',
    pointsCles: 'L’écranteur s’oriente vers la hanche du défenseur ; le porteur sort épaule contre épaule pour que le défenseur ne passe pas.\nAvant l’écran, le porteur feinte de l’autre côté pour amener son défenseur dans l’écran.\nPlonger quand le porteur a passé l’écran et que les deux défenseurs regardent le ballon.\nLes trois autres écartent dans les coins et sur l’aile : l’aide vient de loin.',
    quand: 'Dès qu’on a un meneur qui sait dribbler et passer et un intérieur dangereux près du cercle. Idéal en fin de possession et contre des intérieurs lents.',
    etapes: [
      '5 monte du coude et pose l’écran sur le défenseur de 1 ; 1 feinte d’abord de l’autre côté.',
      '1 sort de l’écran en dribble vers la droite ; 5 plonge vers le panier (« roll »).',
      'Quand le défenseur de 5 monte sur le dribble, 1 donne à 5 qui conclut. Si l’aide arrive du côté gauche, 4 et 2 sont libres pour une passe extérieure.',
    ],
  },
  'pick-and-pop': {
    nom: 'Pick and pop',
    miseEnPlace: 'Variante du pick and roll : au lieu de plonger, l’écranteur s’écarte derrière la ligne à 3 points pour tirer. Un intérieur adroit attire ainsi son défenseur loin de la raquette.',
    pointsCles: 'Ne fonctionne que si l’écranteur sait tirer.\nS’écarter du côté opposé à la pénétration, ou vers le haut, là où la ligne de passe s’ouvre.\nLe porteur lit le défenseur de l’intérieur : pénétrer ou ressortir le ballon.\nAlterner avec le « slip » (partir avant le contact de l’écran).',
    quand: 'Quand l’intérieur adverse monte sur le porteur et que votre intérieur tire à 3 points.',
    etapes: [
      '4, intérieur shooteur, pose l’écran sur le défenseur de 1 côté gauche ; 1 feinte à droite.',
      '1 attaque à gauche en sortant de l’écran ; 4 s’écarte derrière la ligne à 3 points (« pop »).',
      '1 ressort le ballon à 4 qui tire à 3 points dans la foulée.',
    ],
  },
  'spain-pick-and-roll': {
    nom: 'Spain pick and roll',
    miseEnPlace: 'Un pick and roll avec un troisième joueur : juste après l’écran sur le porteur, un shooteur pose un écran dans le dos du défenseur de l’intérieur pour libérer le plongeur, puis s’écarte à 3 points.',
    pointsCles: 'Le shooteur se cache sous l’écran, derrière le défenseur de l’intérieur, et écrante au moment où le roll démarre.\nGrâce à cet écran, le plongeur va au cercle sans défenseur.\nAprès l’écran, le shooteur s’écarte derrière l’arc.\nLe porteur choisit entre le plongeur (lob) et le shooteur (passe extérieure) selon la réaction de la défense.',
    quand: 'Contre une défense qui reste en retrait sur le pick and roll classique, ou qui communique mal sur les changements.',
    etapes: [
      '5 monte poser un écran haut pour 1 ; 2 remonte de la raquette et se place derrière le défenseur de 5.',
      '1 sort de l’écran vers la droite ; 2 pose un écran dans le dos du défenseur de 5.',
      '5 plonge au cercle ; 2 s’écarte en haut (« pop »).',
      'Le défenseur de 2 a aidé sur le plongeur : 1 passe à 2 qui tire à 3 points. Sinon, lob pour 5.',
    ],
  },
  horns: {
    nom: 'Horns',
    miseEnPlace: 'Placement « en cornes » : deux intérieurs aux coudes, deux shooteurs dans les coins. Le meneur choisit son écran d’un côté ou de l’autre, puis les deux intérieurs se trouvent par une passe haut-bas.',
    pointsCles: 'Placement symétrique : l’action part des deux côtés, la défense ne peut pas anticiper.\nLes shooteurs dans les coins éloignent l’aide.\nLe second intérieur remonte en haut pour ouvrir l’angle de passe haut-bas.\nNombreuses variantes : Horns flare, Horns twist, Horns stagger…',
    quand: 'Première attaque placée très courante ; redoutable avec un intérieur bon passeur.',
    etapes: [
      'Placement : 4 et 5 aux coudes, 2 et 3 dans les coins ; 1 arrive en haut.',
      '1 feinte à gauche ; 5 monte poser l’écran côté droit, 4 attend au coude.',
      '1 sort de l’écran à droite et 5 plonge ; 4 remonte en haut pour remplir l’espace.',
      '1 passe à 4 en haut ; quand le défenseur de 4 remonte, 4 lobe pour 5 seul dans la raquette.',
    ],
  },
  'side-pick-and-roll': {
    nom: 'Pick and roll latéral',
    miseEnPlace: 'Pick and roll joué sur l’aile. La défense pousse souvent le porteur vers la ligne de fond (« ICE ») : l’écranteur s’écarte alors au coude pour un tir mi-distance.',
    pointsCles: 'L’écranteur lit le côté pris par le défenseur du porteur : s’il bloque l’écran, se préparer à s’écarter.\n2 reste au fond du coin pour garder la ligne de fond ouverte.\n3 et 4, côté opposé, se placent pour recevoir une passe extérieure.\nLe porteur lit l’intérieur adverse : haut, on plonge ; bas, on s’écarte ou on tire.',
    quand: 'Quand le ballon est déjà sur l’aile et qu’on veut lancer le jeu à deux sans passe supplémentaire.',
    etapes: [
      '5 monte du coude et pose un écran latéral pour 1 sur l’aile droite ; 2, 3 et 4 écartent le jeu.',
      'Poussé vers la ligne de fond, 1 dribble le long de la ligne ; 5 s’écarte au coude.',
      '1 ressort le ballon à 5 qui tire au coude. Si l’aide vient sur 5, 4 est libre côté opposé.',
    ],
  },
  'ghost-screen': {
    nom: 'Écran fantôme',
    miseEnPlace: 'Un shooteur fonce comme pour poser un écran au porteur, puis s’échappe juste avant le contact. La défense, qui se prépare à changer ou à monter, se fait prendre à contre-pied.',
    pointsCles: 'Courir vers le défenseur du porteur comme si l’écran était vrai, sinon la défense ne réagit pas.\nJuste avant le contact, lire la défense : sortir derrière l’arc ou couper au cercle.\nLe porteur passe dès que le shooteur s’échappe : un temps de retard et la défense revient.\n3 et 4 restent dans les coins.',
    quand: 'Contre une équipe qui change sur tous les écrans ou qui anticipe vers le ballon. Encore mieux avec un bon shooteur.',
    etapes: [
      '2 part de l’aile gauche et court droit vers le défenseur de 1 comme pour poser un écran.',
      'Juste avant le contact, 2 s’échappe vers la ligne à 3 points : personne ne le suit.',
      '1 passe à 2 qui tire à 3 points.',
    ],
  },
  weave: {
    nom: 'Weave (passes à la main)',
    miseEnPlace: 'Trois joueurs se croisent en se donnant le ballon de la main à la main. Chaque transmission est un écran en mouvement : la défense doit à chaque fois choisir entre suivre, changer ou passer dessous.',
    pointsCles: 'Celui qui donne le ballon place son corps sur le défenseur du receveur : il devient écran.\nLe receveur feinte d’abord à l’opposé, puis passe au ras du donneur.\nAprès avoir donné, continuer vers l’espace libre pour la transmission suivante.\n5 attend près du cercle pour fixer l’aide en cas de pénétration.',
    quand: 'Pour faire bouger la défense avec les arrières et ailiers seulement, ou enchaîner les actions à deux.',
    etapes: [
      '1 dribble vers l’aile gauche, 3 vient au-devant et reçoit le ballon de la main à la main.',
      '3 dribble vers la droite et donne à son tour le ballon à 2 qui remonte.',
      '2 contourne 3 et file au cercle en dribble pour finir.',
    ],
  },
  floppy: {
    nom: 'Floppy',
    miseEnPlace: 'Le shooteur part sous le panier et choisit un côté : un écran simple d’un côté, un double écran de l’autre. La défense ne sait pas où il va sortir avant le dernier moment.',
    pointsCles: 'Avant de partir, le shooteur feinte du côté opposé.\nLes écrans se posent sur le défenseur du shooteur, pas sur le shooteur.\nPieds et mains prêts avant la réception, tir immédiat.\nSi le défenseur coupe sous les écrans, le shooteur repique vers le cercle.',
    quand: 'Pour un tir après réception d’un bon shooteur ; fréquent en fin de match quand il faut un 3 points.',
    etapes: [
      '2 sous le panier ; à gauche, 4 attend avec un écran simple ; à droite, 5 et 3 forment un double écran. 2 feinte à gauche.',
      '2 change de direction et sort à droite par les deux écrans, jusqu’à l’aile.',
      '1 passe à 2 sur l’aile qui tire aussitôt. Si un défenseur aide sur 2, 5 plonge au cercle.',
    ],
  },
  'elevator-doors': {
    nom: 'Portes d’ascenseur',
    miseEnPlace: 'Deux écranteurs côte à côte comme des portes : dès que le shooteur passe entre eux, ils se resserrent et bloquent le défenseur qui le suit.',
    pointsCles: 'L’espace doit laisser passer un seul joueur, sinon le défenseur suit.\nTout est dans le timing : fermer juste après le passage du shooteur, juste avant le défenseur.\nLe shooteur frôle les épaules des écranteurs.\nUne fois les portes fermées, les écranteurs ne bougent plus (sinon faute d’écran en mouvement).',
    quand: 'Pour un 3 points en haut de la raquette, ou contre un défenseur habile à contourner les écrans.',
    etapes: [
      '4 et 5 côte à côte au-dessus de la ligne des lancers francs, un petit espace entre eux ; 2 entraîne son défenseur sous le panier.',
      '2 sprinte entre les deux intérieurs qui se resserrent aussitôt derrière lui.',
      '1 passe à 2 en haut qui tire à 3 points.',
    ],
  },
  'iverson-cut': {
    nom: 'Coupe Iverson',
    miseEnPlace: 'Le meilleur marqueur traverse d’une aile à l’autre au-dessus de la ligne des lancers francs, pendant que les intérieurs aux coudes écrantent l’un après l’autre. Une entrée de jeu qui lui donne le ballon en mouvement.',
    pointsCles: 'Couper au ras des écranteurs pour que le défenseur ne passe pas par-dessus.\nLe porteur dribble vers le côté où va le coupeur pour raccourcir la passe.\nAprès la réception : tir, pénétration ou pick and roll avec l’intérieur.\nSi la défense coupe la trajectoire haute, partir en porte arrière vers le cercle.',
    quand: 'Pour donner le ballon à votre meilleur marqueur dans une bonne position, surtout s’il est privé de ballon.',
    etapes: [
      '4 et 5 aux coudes, 2 bas sur l’aile gauche ; 1 amène le ballon côté droit.',
      '2 traverse de gauche à droite au-dessus de la ligne des lancers francs, en frôlant les écrans de 4 puis de 5.',
      '1 passe à 2 qui sort sur l’aile droite, prêt à attaquer.',
      '2 attaque le défenseur qui arrive trop vite, pénètre et tire en suspension près de la ligne des lancers francs.',
    ],
  },
  chicago: {
    nom: 'Chicago',
    miseEnPlace: 'Un shooteur sort d’un écran vers le bas puis reçoit aussitôt le ballon de la main à la main d’un intérieur. Son défenseur prend deux écrans de suite.',
    pointsCles: 'L’écran vers le bas fait remonter le shooteur : il reçoit en mouvement.\nL’intérieur qui donne le ballon écrante en même temps.\nAucune pause entre les deux actions.\nSi le défenseur de l’intérieur sort sur le shooteur, l’intérieur plonge au cercle.',
    quand: 'Pour utiliser un shooteur et enchaîner sur un pick and roll, surtout avec un intérieur bon passeur.',
    etapes: [
      '5 monte en haut et reçoit de 1 ; 1 dégage vers l’aile droite.',
      '4 descend poser un écran vers le bas pour 2 ; 2 remonte pendant que 5 dribble vers lui.',
      '5 donne le ballon de la main à la main à 2 et bloque son défenseur au passage.',
      '2 tire à 3 points dans l’espace laissé. Si le défenseur de 5 sort sur 2, 5 plonge.',
    ],
  },
  'flare-screen': {
    nom: 'Écran flare',
    miseEnPlace: 'Un écran bloque le défenseur du shooteur pour qu’il s’éloigne du ballon vers l’aile opposée ; le ballon traverse alors le terrain par une passe transversale.',
    pointsCles: 'L’écranteur se place là où le défenseur doit passer, du côté où le shooteur va s’écarter.\nLe shooteur s’éloigne, pieds prêts à tirer.\nLa passe transversale arrive au moment où il s’arrête.\n5 et 3 restent côté ballon pour y fixer leurs défenseurs.',
    quand: 'Quand la défense se resserre côté ballon et laisse le côté opposé vide.',
    etapes: [
      '1 dribble vers l’aile droite pendant que 4 monte écranter le défenseur de 2, côté gauche.',
      '2 s’éloigne du ballon vers l’aile gauche en utilisant l’écran de 4.',
      '1 envoie une passe transversale à 2 qui tire à 3 points.',
    ],
  },
  zipper: {
    nom: 'Zipper',
    miseEnPlace: '2 part du poste bas et remonte tout droit le long de la raquette, frôle un écran au coude et reçoit en haut, comme une fermeture éclair qu’on remonte.',
    pointsCles: '2 fixe d’abord son défenseur au poste bas, puis remonte le long de la raquette.\n4 se place près du coude, sur la trajectoire du défenseur.\n2 se présente face au panier à la réception ; si le défenseur passe devant, repartir vers le cercle.\n1 passe dès que 2 a passé l’écran.',
    quand: 'Pour recevoir en sécurité quand la défense presse le meneur, ou offrir un tir en haut à un shooteur.',
    etapes: [
      '1 amène le ballon côté droit ; 4 monte au coude gauche et 2 démarre du poste bas gauche.',
      '2 remonte tout droit en frôlant l’écran de 4 jusqu’en haut.',
      '1 passe à 2 qui tire à 3 points.',
    ],
  },
  'ucla-cut': {
    nom: 'Coupe UCLA',
    miseEnPlace: '1 passe sur l’aile puis coupe droit au cercle grâce à un écran dans le dos posé par 5 au poste haut. Le défenseur de 1, qui regarde le ballon, ne voit pas l’écran arriver.',
    pointsCles: 'Après la passe, 1 marque un temps pour que son défenseur regarde le ballon.\n5 se place derrière le défenseur de 1, côté panier.\n1 coupe au ras de l’épaule de 5, droit au cercle.\n2 passe dès que 1 sort de l’écran.',
    quand: 'Pour lancer une attaque avec un intérieur au poste haut, ou quand le défenseur du meneur se retourne vers le ballon après la passe.',
    etapes: [
      '1 passe à 2 sur l’aile droite ; 5 monte au-dessus de la ligne des lancers francs, derrière le défenseur de 1.',
      '1 coupe au cercle en utilisant l’écran de 5.',
      '2 passe à 1 qui finit en double-pas.',
    ],
  },
  'shuffle-cut': {
    nom: 'Coupe shuffle',
    miseEnPlace: '3, sur l’aile opposée au ballon, coupe par-dessus l’écran de 5 au coude et plonge en diagonale vers le poste bas opposé. L’attaque « shuffle » répète ce mouvement depuis des positions qui changent.',
    pointsCles: 'Dès que le ballon arrive à 2, 3 démarre sa coupe.\n5 reste immobile au coude et bloque la trajectoire du défenseur de 3.\n3 frôle l’épaule de 5 puis plonge en diagonale.\n2 passe dès que 3 entre dans la raquette.',
    quand: 'Quand la défense regarde le ballon et vide le côté opposé ; pour marquer près du cercle sans intérieur dominant.',
    etapes: [
      '1 passe à 2 sur l’aile droite ; 3 (aile opposée) et 5 (coude gauche) se préparent.',
      '3 coupe par-dessus l’écran de 5 et plonge en diagonale vers le poste bas droit.',
      '2 passe à terre à 3 qui finit en double-pas.',
    ],
  },
  hammer: {
    nom: 'Hammer',
    miseEnPlace: 'Une pénétration le long de la ligne de fond attire la défense ; de l’autre côté, un écran est posé dans le dos du défenseur venu aider et libère le shooteur dans le coin. Le « pénétrer-ressortir » par excellence.',
    pointsCles: 'La pénétration passe par la ligne de fond : la défense se referme et la ligne de passe vers le coin opposé s’ouvre.\nL’écran se pose derrière le défenseur qui aide : il ne le voit pas.\nLe shooteur glisse de l’aile au coin au rythme de la pénétration.\nUne seule passe, forte, le long de la ligne de fond.',
    quand: 'Avec un ailier qui pénètre et un shooteur dans le coin ; plus l’aide adverse est agressive, mieux ça marche.',
    etapes: [
      '1 a le ballon sur l’aile droite ; côté opposé, 2 est sur l’aile et 4 au poste bas.',
      '1 pénètre fort le long de la ligne de fond ; 4 pose un écran dans le dos du défenseur de 2, qui glisse dans le coin.',
      'Du bout de la ligne de fond, 1 envoie le ballon dans le coin opposé : 2 tire à 3 points.',
    ],
  },
  'split-action': {
    nom: 'Split',
    miseEnPlace: 'Dès que le ballon entre au poste, les deux joueurs sans ballon s’écrantent mutuellement et se séparent. Pendant que la défense s’occupe du coupeur, c’est l’écranteur qui se retrouve libre à 3 points.',
    pointsCles: 'La passe au poste déclenche l’action.\nPlus dangereux encore si l’écranteur est le meilleur shooteur.\nLe coupeur lit la défense (boucle, écartement ou porte arrière) ; l’écranteur part à l’opposé.\nLe joueur au poste doit voir les trois options : la coupe, le tir extérieur, le un-contre-un.',
    quand: 'Avec un intérieur bon passeur au poste ou au coude, et au moins deux shooteurs.',
    etapes: [
      '5 se place au poste bas gauche et 1 lui passe à terre.',
      'Après la passe, 1 remonte écranter le défenseur de 2.',
      '2 boucle au ras de l’écran vers le cercle ; 1 ressort derrière l’arc.',
      '5 ressort le ballon du poste vers 1, libre, qui tire à 3 points.',
    ],
  },
  'double-drag': {
    nom: 'Double drag',
    miseEnPlace: 'Juste après la récupération, deux intérieurs qui arrivent en retard posent deux écrans à la suite pour le meneur qui remonte la balle. Le premier s’écarte à 3 points, le second plonge au cercle.',
    pointsCles: 'Les deux intérieurs suivent le ballon et s’alignent l’un derrière l’autre du côté où va 1.\n1 sort des deux écrans épaule contre épaule.\nRôles décidés à l’avance : le premier s’écarte, le second plonge.\n2 et 3 restent dans les coins.',
    quand: 'Juste après la récupération, avant que la défense soit en place ; encore mieux si un intérieur tire à 3 points.',
    etapes: [
      '1 remonte le ballon ; 4 et 5 arrivent et posent deux écrans à la suite ; 2 et 3 filent dans les coins.',
      '1 sort des deux écrans vers la droite ; 4 s’écarte derrière l’arc à gauche, 5 plonge au cercle.',
      'Quand le défenseur de 5 monte sur 1, 1 lobe pour 5 qui conclut.',
    ],
  },
  pistol: {
    nom: 'Pistol (21)',
    miseEnPlace: 'Juste après la récupération, 1 dribble vers l’aile et donne le ballon de la main à la main à 2 qui remonte du coin. Un jeu à deux lancé avant que la défense soit en place.',
    pointsCles: '1 dribble vers l’aile, ralentit et se sert de son corps comme écran.\n2 remonte la ligne de touche depuis le coin et passe à l’extérieur de 1.\n5 sprinte d’abord au cercle et fixe l’intérieur adverse.\n4 arrive en retard et reste en haut en soutien.',
    quand: 'Pour les équipes qui jouent vite : les deux arrières lancent l’attaque avant tout système.',
    etapes: [
      '1 pousse le ballon vers l’aile droite, 2 remonte du coin ; 5 sprinte au cercle et 4 arrive en haut.',
      '1 donne le ballon à 2 de la main à la main et bloque son défenseur.',
      '2 contourne 1 et file au cercle en dribble.',
    ],
  },
  'trailer-pop': {
    nom: 'Trailer pop',
    miseEnPlace: 'En transition, 5 sprinte au cercle et le second intérieur, 4, arrive en retard pour écranter 1 puis s’écarte à 3 points. Les intérieurs adverses, occupés à protéger le cercle, l’oublient.',
    pointsCles: '5 sprinte jusqu’au cercle et entraîne un intérieur adverse dans la raquette.\n4 arrive un temps après le ballon et écrante en haut.\nAprès l’écran, 4 s’écarte derrière l’arc, du côté opposé à 1.\n2 et 3 dans les coins.',
    quand: 'Avec un intérieur shooteur, contre une équipe qui revient d’abord protéger le cercle.',
    etapes: [
      '5 sprinte au cercle pendant que 1 remonte le ballon ; 4 arrive et pose l’écran en haut.',
      '1 sort de l’écran à gauche ; 4 s’écarte derrière l’arc à droite.',
      '1 attire la défense puis ressort le ballon à 4 qui tire à 3 points.',
    ],
  },
  flex: {
    nom: 'Flex',
    miseEnPlace: 'Attaque organisée : après un renversement du ballon, 3 coupe depuis la ligne de fond grâce à l’écran de 5 au poste bas et traverse la raquette vers le poste bas opposé. Si la coupe est prise, on écrante l’écranteur, et les mêmes mouvements se répètent.',
    pointsCles: 'La coupe démarre au moment du renversement.\n5 tient le poste bas et bloque la trajectoire du défenseur de 3.\n3 frôle l’épaule de 5 et traverse la raquette.\nAprès sa passe, 2 se prépare à descendre écranter pour 5.',
    quand: 'Pour faire tourner le ballon patiemment et obtenir des tirs faciles, avec des joueurs qui savent tous écranter et couper.',
    etapes: [
      '2 renverse le ballon de droite à gauche vers 1 ; 5 et 3 se préparent.',
      '3 coupe au ras de l’écran de 5 et traverse la raquette vers le poste bas gauche.',
      '1 passe à terre à 3 qui finit en double-pas.',
    ],
  },
  'princeton-chin': {
    nom: 'Princeton « chin »',
    miseEnPlace: 'Placement 2-2-1 : deux arrières en haut, deux ailiers sur les ailes, le pivot au poste haut. Après la passe entre arrières, 1 coupe au cercle grâce à l’écran dans le dos de 5. Une attaque en mouvement qui enchaîne passes, coupes et portes arrière.',
    pointsCles: '1 passe à 2 et marque un temps pour que son défenseur regarde le ballon.\n5 descend du poste haut et se place derrière le défenseur de 1, côté panier.\n1 coupe au ras de l’épaule de 5 ; si c’est pris, continuer vers l’espace libre.\nAprès la coupe, 5 enchaîne sur l’écran suivant.',
    quand: 'Avec des intérieurs passeurs, surtout contre une défense qui coupe agressivement les lignes de passe.',
    etapes: [
      '1 passe de gauche à droite à 2 ; 5 descend du poste haut et se place derrière le défenseur de 1.',
      '1 coupe au cercle en utilisant l’écran de 5.',
      '2 passe à terre à 1 qui finit en double-pas.',
    ],
  },
  delay: {
    nom: 'Delay',
    miseEnPlace: 'Attaque organisée autour du pivot, 5, qui tient le ballon en haut. 5 dribble vers une aile et donne le ballon de la main à la main à un shooteur qui remonte : pénétration, porte arrière ou 3 points selon la défense.',
    pointsCles: '5 reçoit en haut près de l’arc et éloigne l’intérieur adverse du cercle.\n2 remonte de l’aile en passant à l’extérieur de 5.\nAu moment de donner, le corps de 5 bloque le défenseur de 2.\n1, 3 et 4 restent écartés.',
    quand: 'Avec un pivot bon passeur, ou pour faire tourner l’horloge en éloignant la défense du cercle.',
    etapes: [
      '5 monte du poste haut et reçoit de 1 en haut ; 1 s’écarte sur l’aile gauche.',
      '5 dribble vers l’aile droite et donne le ballon à 2 qui remonte par l’extérieur.',
      '2 contourne 5 et file au cercle en dribble : le cercle n’est plus protégé.',
    ],
  },
  'sideline-triangle': {
    nom: 'Triangle',
    miseEnPlace: 'Placement de base de l’attaque en triangle : d’un côté le poste (5), l’aile (3) et le coin (2) forment un triangle, deux joueurs de l’autre côté. Tout part d’une passe au poste, et chaque réaction de la défense a sa réponse.',
    pointsCles: '3 reçoit sur l’aile et regarde d’abord 5 au poste.\n2 reste écarté dans le coin pour éloigner son défenseur.\nSi le poste est privé de ballon, 4 surgit au coude en deuxième solution.\nAprès la passe au poste, continuer à couper et écranter.',
    quand: 'Avec un intérieur à l’aise au poste et cinq joueurs qui ont appris les places et les réponses.',
    etapes: [
      '1 dribble côté droit : 5 au poste, 3 sur l’aile et 2 dans le coin forment le triangle, 4 côté opposé.',
      '1 passe à 3 sur l’aile, qui donne aussitôt au poste à 5.',
      '3 descend vers le coin et 2 remonte : ils se croisent ; 2 boucle autour de 5 qui lui passe pour le double-pas.',
    ],
  },
}

const DEPOT = 'https://github.com/HPotty36/3d-hoops-playbook'
const SOURCE = `« 3D Hoops Playbook » de HPotty36 (${DEPOT}), licence MIT ; traduit et adapté`

function jouer(a: Actions, [type, cle, ...reste]: Op) {
  if (type === 'passe') a.passe(cle, reste[0] as string)
  else if (type === 'tir') a.tir(cle)
  else if (type === 'coupe' || type === 'dribble' || type === 'ecran') a[type](cle, ...(reste as Point[]))
  else throw new Error(`opération inconnue : ${type}`)
}

const systemes = Object.entries(FICHES).map(([id, f]) => {
  const j = MIT[id]
  if (j.etapes.length !== f.etapes.length) throw new Error(`${id} : ${j.etapes.length} étapes, ${f.etapes.length} textes`)
  const d = systeme({
    id: `mit-${id}`, nom: f.nom, categorie: j.categorie === 'early' ? 'Contre-attaque' : 'Attaque', source: SOURCE, duree: 10,
    miseEnPlace: f.miseEnPlace, pointsCles: f.pointsCles, variantes: `Quand l’utiliser : ${f.quand}`,
  }, j.depart, [j.ballon])
  j.etapes.forEach((ops, k) => d.etape(f.etapes[k], (a) => ops.forEach((op) => jouer(a, op))))
  return d.fin()
})
if (systemes.length !== Object.keys(MIT).length) throw new Error('fiche manquante')

export const mit: Paquet = {
  id: 'mit',
  titre: 'Systèmes d’attaque classiques',
  description: '24 systèmes d’attaque : pick and roll, horns, floppy, flex, triangle, transition…',
  credits: `${SOURCE}. Copyright (c) 2026 HPotty36.`,
  licence: readFileSync(new URL('mit-licence.txt', import.meta.url), 'utf8'),
  systemes,
  seances: [],
}
