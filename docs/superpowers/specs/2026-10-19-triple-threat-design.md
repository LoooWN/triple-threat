# Triple Threat — design validé (2026-10-19)

PWA iPad (paysage, au doigt) pour un coach de basket amateur : préparer et expliquer ses systèmes, puis les faire réviser aux joueurs. Interface 100 % en français. Sans compte ni serveur.

## Contraintes
- Vite + React + TypeScript, terrain en SVG, Pointer Events, grandes zones tactiles (iPad classique 10,2"/10,9", pas d'Apple Pencil — le Pencil doit quand même marcher).
- 100 % hors ligne après la première ouverture : tout est précaché (vite-plugin-pwa), aucune ressource externe (police système, icônes dessinées en SVG).
- `navigator.storage.persist()` au démarrage. Bandeau « Nouvelle version disponible » non bloquant.
- IndexedDB (idb-keyval) + export/import JSON. L'import n'écrase jamais : conflit d'id → copie.
- Test obligatoire : l'appli s'ouvre et fonctionne en mode avion (Playwright, réseau coupé).
- Design original (aucun nom ni graphisme d'appli existante).
- Hébergement : dépôt GitHub public LoooWN/triple-threat + GitHub Pages.

## Repère
Mètres. `x` = distance à la ligne de fond (0 → longueur), `y` = distance à la ligne de touche (0 → largeur). Panier attaqué en x = 1,575, y = largeur/2.
- Demi-terrain : x ∈ [0, longueur/2], affiché panier en haut (écran : sx = y, sy = x).
- Terrain entier : affiché panier attaqué à droite (écran : sx = longueur − x, sy = y).
- Miroir gauche-droite : y → largeur − y (joueurs, chemins, textes).

## Terrain réglable
`terrain: { vue: "demi"|"entier", longueur, largeur, ligne3pts: number|null }`.
Préréglages : Standard (U13 → seniors) 28×15, 6,75 ; Mini-basket (U7 → U11) 28×15, sans ligne (6,25 / 6,75 au choix) ; Personnalisé.
Raquette 4,90 × 5,80, cercles 1,80, panier, planche et zone de non-charge aux cotes FIBA sur tous les terrains. Ligne à 3 pts : coins à `min(R, largeur/2 − 0,9)` de l'axe. Un nouveau système reprend le dernier terrain choisi.

## Modèle
```ts
type Point = [number, number]
Joueur  { id: "A1".."A5" | "D1".."D5", camp: "attaque"|"defense", numero, x, y }
Action  { id, type: "coupe"|"passe"|"dribble"|"ecran", joueur, vers?, chemin: Point[], couleur }
Texte   { id, x, y, texte }
Etape   { id, description, joueurs, ballon: string|null, actions, textes }
Systeme { id, nom, terrain, creeLe, modifieLe, etapes }
Fichier { format: "triple-threat", version: 1, exporteLe, systemes }
```
`chemin` = départ, courbure, arrivée (+ courbure, arrivée par coin net) : courbes de Bézier quadratiques enchaînées.

## Règles (validées)
- Étape suivante : chaque joueur va au bout de sa dernière action de déplacement (coupe, dribble, écran), sinon reste. Ballon : receveur de la dernière passe, sinon le porteur.
- Modifier une étape : les étapes suivantes se mettent à jour pour les joueurs placés automatiquement (position = ancienne arrivée) ; ceux déplacés à la main restent.
- Passe : accrochée au joueur le plus proche de son arrivée (position de fin d'étape).
- Un trait doit partir d'un joueur (ou du bout de sa dernière action), sinon il est ignoré avec un message. Un trait commencé sur un pion (0,6 m) lui appartient toujours.
- Animation d'une étape (révisé le 2026-10-19 après essai sur iPad) : tout part en même temps ; un joueur enchaîne seulement ses propres actions ; une passe ou un dribble attend que le joueur ait le ballon. Durée : 1,8 s par « temps ».
- +5 défenseurs : chacun à 1 m de son attaquant vers le panier, notés X1..X5.
- Pencil : dessine toujours. Doigt : interrupteur Placer / Dessiner.

## Écrans phase 1
- « Mes systèmes » : créer (nom + terrain), ouvrir, renommer, supprimer, exporter un système, tout sauvegarder, importer.
- Éditeur : barre (retour, nom, annuler, rétablir, miroir), outils à gauche (Placer, Dessiner, Défenseur, +5 déf., Texte), terrain, panneau Étapes (pastilles, +, description, dupliquer, supprimer, ◀ Lire ▶, vitesse). En terrain entier le panneau passe sous le terrain.
- Gestes en mode Placer : toucher vide = joueur suivant (1→5) ; toucher joueur = menu (numéro 1 à 5 échangé dans tout le système, donner / enlever le ballon, retirer) ; glisser joueur = déplacer ; toucher action = poignées ; appui long action = type / couleur / supprimer ; appui long texte = menu.
- Relâcher un trait = 4 gros boutons Coupe / Passe / Dribble / Écran.
- Annuler / rétablir : jusqu'à 100 pas. Sauvegarde automatique.

## Hors périmètre phase 1
Catégories, recherche, variantes, effectif, exercices, séances, tableau blanc, PDF (phase 2) ; mode révision (phase 3).

---

# Phase 2 — validée le 2026-10-19

Livrée en 5 morceaux, chacun testé et mis en ligne : 2a bibliothèque + effectif, 2b exercices, 2c séances + présentation, 2d tableau blanc, 2e export image / PDF.

## Décisions de Logan
- Plusieurs équipes dans l'effectif.
- Sur le terrain, il veut surtout les **numéros de maillot** : dans chaque système, chaque pion peut être relié à un joueur de l'équipe choisie ; le pion affiche alors son maillot (nom en petit dessous). Pas de « cinq » global.
- Exercices : plusieurs joueurs peuvent avoir un ballon en même temps. Dans un système, un seul ballon.

## Modèle (version 2 du fichier, conversion automatique de la version 1)
- Document (système ou exercice) : `genre`, `categorie`, `equipe` (id ou null), `maillots` (id du pion → id du joueur d'équipe), `materiel` (fixe pour tout le document : plot, échelle avec `angle`, ballon au sol), `miseEnPlace`, `pointsCles`, `variantes`, `dureeConseillee` (min).
- Étape : `ballons: string[]` remplace `ballon`. Une passe enlève le ballon au passeur (s'il en a un) et en donne un au receveur.
- Camp `coach` (pion « C ») : peut se déplacer, passer et recevoir. Les défenseurs ne reçoivent pas de passe.
- Équipe : `{ id, nom, joueurs: [{ id, nom, maillot }] }` (maillot en texte pour « 0 » et « 00 »).
- Séance : `{ id, nom, date, blocs: [{ id, document, duree, note }] }`.
- Fichier : `{ format: "triple-threat", version: 2, exporteLe, systemes, seances, equipes }`. Import : système ou séance déjà présent à l'identique → ignoré, modifié → copie (les séances importées suivent les nouveaux ids) ; équipe déjà présente → gardée telle quelle.
- Les systèmes de la version 1 deviennent des systèmes de catégorie « Attaque ».

## Écrans
- Bibliothèque : onglets Systèmes / Exercices / Séances / Effectif ; recherche (sans tenir compte des accents) ; filtres par catégorie ; sections par catégorie ; menu d'une carte : renommer, catégorie, dupliquer en variante (« Nom – variante »), exporter, supprimer.
- Catégories par défaut — systèmes : Attaque, Défense, Remise en jeu, Contre-attaque, Fin de match ; exercices : Échauffement, Tir, Passe, Dribble, Défense, Jeu réduit. On peut en créer.
- Éditeur : barre réduite (retour, nom, annuler, rétablir, tableau blanc, « Plus » : miroir, terrain, équipe, exporter). Exercices : jusqu'à 15 joueurs par camp, outils Coach et Matériel, panneau « Étapes / Fiche ».
- Séance : liste de blocs (durée ± 5 min, note, monter, descendre, retirer), total, « Présenter ». Présentation plein écran : schéma animé, fiche, minuteur par bloc, précédent / suivant, écran maintenu allumé.
- Tableau blanc : calque par-dessus le terrain, 4 couleurs, 3 épaisseurs, « Effacer tout » ; tout disparaît en fermant.
- Export : image PNG (étape ou système complet) et PDF (système, exercice, playbook par catégorie) avec jsPDF embarqué.

---

# Phase 3 — validée le 2026-10-19

Les joueurs regardent et révisent **sur leur téléphone**, sans le coach. Livraisons : 3a révision (questions, correction, scores), 3b présentation grand format, 3c lien de révision + écrans téléphone.

## Révision
- Au début : « Je joue le N » (postes du camp qui a le plus d'actions dans le document) ou « Tous les postes ».
- Par étape, pour le joueur du poste choisi (ou, en « Tous », chaque joueur qui a une action) :
  1. « Que fait le N ? » : Coupe / Passe / Dribble / Écran / Ne bouge pas (première action ; « Ne bouge pas » seulement en mode poste) ;
  2. s'il se déplace : « Où va le N ? » : glisser le pion ou toucher l'endroit, puis Valider ; juste à 1,5 m près de sa position de fin d'étape ;
  3. s'il passe : « À qui passe le N ? » : toucher le receveur.
- L'étape est montrée sans flèches pendant la question ; après la réponse : l'étape se joue (animation), la bonne réponse est marquée, la réponse fausse reste visible.
- Fin : score « bonnes / total », étapes ratées, Recommencer.
- Résultat enregistré sur l'appareil : `{ id, document, date, poste|null, bonnes, total }`. « À retravailler » = dernier score < 80 % ou jamais révisé.

## Lien de révision
- Le coach choisit les documents affichés (filtre / recherche, ou un seul via le menu d'une carte) → « Lien de révision » → préparation puis bouton Envoyer (feuille de partage) ou Copier.
- Adresse : `…/triple-threat/#revision=` + JSON compressé (deflate, base64url) : `{ format: "triple-threat-revision", version: 1, id, titre, creeLe, systemes }`. Sans équipe ni maillots (joueurs mineurs : seuls les numéros de poste circulent).
- À l'ouverture : le paquet est vérifié et gardé sur le téléphone (même titre → remplacé), puis l'adresse est nettoyée. Un appareil sans documents à lui mais avec des paquets ouvre directement l'écran Révision (pas d'onglets coach).
- Limite connue : sur iPhone, la page ouverte depuis le lien vit dans Safari, à part de l'appli installée ; Safari peut effacer les scores après 7 jours sans visite (le lien, lui, reste valable).

## Présentation grand format
- « Présenter en grand » (menu d'une carte, menu Plus de l'éditeur, bouton « Regarder » en révision) : terrain plein écran, description en très gros, toucher à droite = étape suivante animée, à gauche = étape précédente.

## Téléphone
- Révision et grand format s'adaptent au téléphone (vertical : terrain en haut, question dessous ; horizontal : côte à côte). Le message « Tourne l'iPad » ne concerne plus que l'éditeur et la présentation de séance.
