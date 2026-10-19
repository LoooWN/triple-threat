# Phase 1 — Éditeur de systèmes : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA hors ligne « Triple Threat » avec l'éditeur de systèmes complet de la phase 1.
**Architecture:** logique pure et testée dans `src/modele/` (aucun React), stockage dans `src/stockage.ts`, interface React dans `src/ui/`. L'éditeur garde un historique de copies du système ; toute modification d'étape passe par `modifierEtape` qui propage aux étapes suivantes.
**Tech Stack:** Vite 8, React 19, TypeScript 7, vite-plugin-pwa 2, idb-keyval 6, Vitest 5, Playwright 1.64.
**Spec:** `docs/superpowers/specs/2026-10-19-triple-threat-design.md`

## Global Constraints
- Interface en français ; aucune ressource externe chargée à l'exécution.
- `base: '/triple-threat/'` (GitHub Pages).
- Format d'export : `{ format: "triple-threat", version: 1, exporteLe, systemes }`.
- Cibles tactiles ≥ 48 px ; `touch-action: none` sur le terrain.

## Review Focus
1. Trait commencé loin de tout joueur → message, rien n'est créé (test `lissage`/`attacherTrait`).
2. Fichier importé abîmé ou d'une autre appli → message clair, aucune donnée touchée (`fichier.test.ts`).
3. Import d'un système déjà présent → ajouté en copie, rien d'écrasé (`fichier.test.ts`).
4. Modifier l'étape 1 quand l'étape 3 existe → la propagation descend en cascade (`etapes.test.ts`).
5. Rechargement en mode avion → l'appli et les systèmes sont là (`e2e/hors-ligne.spec.ts`).

---

### Task 1 : squelette PWA hors ligne
**Files:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `public/` (icônes), `scripts/icones.mjs`, `src/main.tsx`, `src/ui/MiseAJour.tsx`, `playwright.config.ts`, `e2e/hors-ligne.spec.ts`
- [ ] Config PWA : `registerType: 'prompt'`, précache `**/*.{js,css,html,svg,png,webmanifest}`, manifest (nom, `display: standalone`, `orientation: landscape`, icônes 192/512).
- [ ] Test e2e : ouvrir, attendre le service worker, couper le réseau, recharger → titre visible.
- [ ] `npm run build && npx playwright test` → PASS. Commit.

### Task 2 : modèle et logique d'étapes
**Files:** `src/modele/types.ts`, `src/modele/etapes.ts`, `src/modele/etapes.test.ts`
**Produces:** `positionsFinales(e: Etape): Map<string, Point>`, `ballonFinal(e: Etape): string|null`, `etapeSuivante(e: Etape): Etape`, `deplacerJoueur(e: Etape, id: string, p: Point): Etape`, `propager(etapes: Etape[], i: number, avant: Etape): Etape[]` (étape i déjà remplacée).
- [ ] Tests : fin de dernière coupe/dribble/écran ; joueur sans action immobile ; ballon → receveur de la dernière passe ; dribbleur garde le ballon ; `deplacerJoueur` déplace le départ de ses actions et l'arrivée des passes vers lui ; propagation : joueur auto suivi, joueur déplacé à la main conservé, cascade étape 3, ballon propagé.
- [ ] Implémentation, tests verts, commit.

### Task 3 : miroir, défense, lissage, fichier
**Files:** `src/modele/{miroir,defense,lissage,fichier,geometrie}.ts` + tests
**Produces:** `miroirEtape(e, largeur)`, `miroirSysteme(s)`, `placerDefense(e, terrain)`, `lisserTrace(pts: Point[]): Point[]|null`, `attacherTrait(e, chemin): {joueur, chemin}|null`, `exporter(s: Systeme[]): string`, `importer(texte: string, existants: Systeme[]): Systeme[]` (lève `Error` en français), `echantillonner(chemin, pas): Point[]`, `pointA(chemin, f): Point`.
- [ ] Tests : miroir y → largeur − y et double miroir = identité ; défense à 1 m vers le panier sans doublon ; trait droit → 3 points, arc → courbure du bon côté, V → 5 points avec coin au sommet, trait minuscule → null ; aller-retour export/import ; conflit d'id → copie « (copie) » ; JSON invalide / mauvais format / champ manquant → Error.
- [ ] Commit.

### Task 4 : stockage et écran « Mes systèmes »
**Files:** `src/stockage.ts`, `src/ui/Liste.tsx`, `src/ui/NouveauSysteme.tsx`, `src/App.tsx`
**Produces:** `listerSystemes()`, `enregistrerSysteme(s)`, `supprimerSysteme(id)`, `demanderPersistance()`, `partagerFichier(nom, texte)`.
- [ ] Créer / ouvrir / renommer / supprimer / exporter / tout sauvegarder / importer. Vérif manuelle dans le navigateur. Commit.

### Task 5 : terrain SVG
**Files:** `src/ui/Terrain.tsx`, `src/ui/LignesTerrain.tsx`, `src/ui/dessinActions.ts`
- [ ] Lignes FIBA paramétrées, joueurs, ballon, actions (coupe, passe pointillée, dribble ondulé, écran à barre, flèches), textes. Capture d'écran 1180×820 demi et entier. Commit.

### Task 6 : gestes et éditeur
**Files:** `src/ui/Editeur.tsx`, `src/ui/useHistorique.ts`, `src/ui/Terrain.tsx`, `src/ui/Menus.tsx`
- [ ] Placer/Dessiner/Défenseur/Texte, choix du type au relâchement, poignées, appuis longs, annuler/rétablir, étapes, miroir. Commit.

### Task 7 : animation
**Files:** `src/modele/animation.ts` (+ test), `src/ui/Editeur.tsx`
**Produces:** `etatAnime(e: Etape, t: number): { positions: Map<string, Point>, ballon: Point|null }` (t ∈ [0,1], déplacements sur [0, 0,65], passes sur [0,65, 1]).
- [ ] Test : t=0 positions de départ, t=1 positions finales, ballon au receveur. Lecture continue, pas à pas, vitesse. Commit.

### Task 8 : vérification finale et mise en ligne
- [ ] e2e complet hors ligne (poser 5 joueurs, tracer une coupe, étape suivante, recharger hors ligne → système présent).
- [ ] Dépôt public LoooWN/triple-threat, workflow GitHub Pages, URL vérifiée.
