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
- Un trait doit partir d'un joueur (ou du bout de sa dernière action), sinon il est ignoré avec un message.
- Animation d'une étape : déplacements simultanés, puis les passes.
- +5 défenseurs : chacun à 1 m de son attaquant vers le panier, notés X1..X5.
- Pencil : dessine toujours. Doigt : interrupteur Placer / Dessiner.

## Écrans phase 1
- « Mes systèmes » : créer (nom + terrain), ouvrir, renommer, supprimer, exporter un système, tout sauvegarder, importer.
- Éditeur : barre (retour, nom, annuler, rétablir, miroir), outils à gauche (Placer, Dessiner, Défenseur, +5 déf., Texte), terrain, panneau Étapes (pastilles, +, description, dupliquer, supprimer, ◀ Lire ▶, vitesse). En terrain entier le panneau passe sous le terrain.
- Gestes en mode Placer : toucher vide = joueur suivant (1→5) ; toucher joueur = ballon ; glisser joueur = déplacer ; toucher action = poignées ; appui long action = type / couleur / supprimer ; appui long joueur ou texte = menu.
- Relâcher un trait = 4 gros boutons Coupe / Passe / Dribble / Écran.
- Annuler / rétablir : jusqu'à 100 pas. Sauvegarde automatique.

## Hors périmètre phase 1
Catégories, recherche, variantes, effectif, exercices, séances, tableau blanc, PDF (phase 2) ; mode révision (phase 3).
