# Handoff : Page d'accueil — Acre Rénovation

## Overview
Refonte de la page d'accueil d'Acre Rénovation, entreprise générale de rénovation en Gironde (Bordeaux Métropole + Bassin d'Arcachon, active depuis 2018). Objectif : réassurance sur des projets à budget élevé (30 k€ – 200 k€+) et génération de demandes de devis en ligne. La cible est CSP+, 35-65 ans, trafic majoritairement mobile.

Cible technique du projet réel : **Astro + Sveltia CMS, hébergé sur Cloudflare Pages.**

## About the Design Files
Le fichier `Accueil.dc.html` de ce bundle est une **référence de design réalisée en HTML** — un prototype montrant l'apparence et le comportement souhaités, **pas du code de production à copier tel quel**. La tâche consiste à **recréer ce design dans l'environnement cible** (Astro, avec composants `.astro`/`.svelte` selon les conventions du projet, contenus éditables via Sveltia CMS) en suivant les patterns et libs déjà en place. Le HTML utilise un runtime interne (`support.js`, balises `<x-dc>`, `image-slot`) qui ne doit **pas** être porté — ne reprendre que le markup, les styles et la structure.

## Fidelity
**High-fidelity (hifi).** Couleurs, typographie, espacements et états d'interaction sont définitifs. Recréer l'UI au pixel près avec les libs du codebase. Les photos sont des placeholders (`<image-slot>`) à remplacer par les vraies photos de chantier gérées via le CMS.

## Screens / Views

### Page d'accueil (`Accueil.dc.html`)
Une seule page longue, largeur de contenu max **1240px**, gouttières latérales **40px** (à réduire ~28px sur mobile). Fond global `#fbfaf7`. Toutes les grilles multi-colonnes utilisent `repeat(auto-fit, minmax(…, 1fr))` — elles se réagencent du desktop au mobile sans média-queries.

Sections dans l'ordre :

1. **Header (sticky)** — hauteur 76px, fond `rgba(251,250,247,0.92)` + `backdrop-filter: blur(8px)`, bordure basse `#ece6da`. À gauche logotype « ACRE. » (le point en `#e47b02`). Nav centrale (15px / 500) : Rénovation globale · Nos expertises ▾ · Réalisations · Guides · Entreprise. Le sous-menu « Nos expertises » s'ouvre au survol (dropdown blanc, ombre discrète, 4 liens). À droite bouton plein « Demander un devis » (`#211c17` sur `#f7f3ec`, radius 4px, puce ronde `#e47b02`).
2. **Hero** — eyebrow (uppercase, `#8a8070`, trait `#e47b02` de 26px), H1 Bricolage Grotesque 600, `clamp(40px,6vw,72px)`, line-height 1.02, letter-spacing -0.02em. Sous-titre 19px `#554e42`. Double CTA : plein sombre « Demander un devis » + contour « Voir les réalisations → ». En dessous, grande photo pleine largeur `aspect-ratio: 16/8`, radius 6px.
3. **Bandeau réassurance** — grille 4 colonnes (`minmax(210px,1fr)`), séparateurs 1px `#ece6da` (technique gap:1px + fond). 4 blocs : « Depuis 2018 », « Garantie décennale », « Assurances pro. », « Interlocuteur unique » (titre 20px Bricolage + sous-texte 14px `#7a7162`).
4. **Nos expertises** (`#renovation-globale`) — eyebrow + H2. **Carte featured « Rénovation globale »** en 2 colonnes (`minmax(320px,1fr)`) : photo (ratio 4/3) + texte (index « 01 — Activité principale » en `#e47b02`, H3 32px, paragraphe, lien flèche). Puis **4 cartes** (`minmax(220px,1fr)`) : photo ratio 4/3 + index 02–05 + titre 19px + phrase courte. Ids : `#exp-extension`, `#exp-piscine`, `#exp-cuisine`, `#exp-amenagement`.
5. **Réalisations** (`#realisations`) — 4 vignettes (`minmax(220px,1fr)`), photo `aspect-ratio: 3/4` radius 6px, **badge ville** en haut-gauche (`rgba(251,250,247,0.94)`, 12px/600). Sous chaque photo : titre 18px + méta 14px `#7a7162`. Villes : Mérignac, Cap Ferret, Pessac, Andernos.
6. **Zone d'intervention** — bande `#f2eee5`, bordures haut/bas `#eae3d6`. 2 colonnes (`minmax(300px,1fr)`) : texte + chips villes (fond `#fbfaf7`, bordure `#e2daca`, radius 4px) à gauche ; **schéma SVG sobre** à droite (cercles de rayon 100 km, Bordeaux point orange, autres villes points gris, trait pointillé « Océan »). Le SVG est décoratif — le recréer ou remplacer par une vraie carte stylisée.
7. **Méthode** (`#entreprise`) — H2 + grille 4 colonnes (`minmax(220px,1fr)`), séparateurs `border-top: 1px #e7e0d3`. Étapes 01→04 (index orange, titre 21px, texte 14.5px) : Premier contact · Étude & chiffrage · Réalisation · Livraison.
8. **Guides** (`#guides`) — 3 cartes (`minmax(260px,1fr)`), `border-top: 2px solid #211c17`, kicker catégorie uppercase, titre 22px, extrait, lien « Lire le guide → ».
9. **CTA final** (`#devis`) — panneau `#211c17` radius 8px, padding `clamp(48px,6vw,84px)` / `clamp(28px,5vw,64px)`, 2 colonnes (`minmax(300px,1fr)`). H2 clair, texte `#b8b0a2`, bouton plein **orange** `#e47b02` texte `#211410` « Demander un devis gratuit → » + mention « Réponse sous 48 h ouvrées · sans engagement ».
10. **Footer** — bordure haute `#ece6da`. 4 colonnes (`minmax(190px,1fr)`) : marque + baseline ; Expertises ; Entreprise ; **Nos zones d'intervention** (chips liens villes). Barre basse : © 2026, Mentions légales, Politique de confidentialité.
11. **Barre CTA collante mobile** — `position: fixed` en bas, visible uniquement ≤ 860px (piloté en JS via `matchMedia`), bouton plein « Demander un devis » pleine largeur, respecte `env(safe-area-inset-bottom)`.

## Interactions & Behavior
- **Dropdown « Nos expertises »** : ouverture au `mouseenter` / fermeture au `mouseleave` du conteneur ; caret ▼ pivote 180° (`transition: transform .18s ease`). En mobile, remplacer par un menu burger accessible.
- **Ancres** : la nav et les CTA pointent vers des ancres de section (`#realisations`, `#devis`, etc.). Dans le vrai site, `#devis` mènera au configurateur/formulaire de devis (généré ultérieurement).
- **Hovers** : boutons sombres → `#000` ; bouton orange → `#f38a15` ; liens → `#b85e04` ; cartes → bordure `#d8d1c3`/`#c9c0ae` ; items dropdown → fond `#f5f1e9`.
- **Barre collante mobile** : affichée/masquée selon `matchMedia('(max-width: 860px)')`.
- **Responsive** : toutes les grilles `auto-fit` s'empilent naturellement ; réduire les gouttières et tailles de titres (les `clamp()` s'en chargent en partie).

## State Management
Minimal côté front :
- `expertisesOpen: boolean` — état du dropdown expertises.
- `isMobile: boolean` — dérivé de `matchMedia('(max-width: 860px)')`, pilote l'affichage de la barre CTA collante.

Aucun fetch de données dans le prototype. Dans le vrai site, les listes (expertises, réalisations, guides, villes) proviendront de collections de contenu Astro éditées via Sveltia CMS.

## Design Tokens

**Couleurs**
- Fond principal : `#fbfaf7`
- Fond alterné (zone intervention) : `#f2eee5`
- Placeholder photo : `#ece7dd`
- Encre / texte fort & surfaces sombres : `#211c17`
- Texte courant : `#554e42`
- Texte secondaire / méta : `#7a7162`
- Eyebrow / muted : `#8a8070`, `#a99f8d`, `#b1a795`
- Bordures : `#ece6da`, `#e7e0d3`, `#eae3d6`, `#e2daca`, `#d8d1c3`
- **Accent (logo) : `#e47b02`** — hover `#f38a15`, hover liens `#b85e04`, texte sur orange `#211410`
- Texte clair sur sombre : `#f7f3ec`, `#fbf8f2`, `#b8b0a2`, `#8f877a`

**Typographie**
- Titres : **Bricolage Grotesque** (400–700), letter-spacing négatif sur les gros titres (-0.02em → -0.015em)
- Texte courant : **Hanken Grotesk** (400/500/600)
- Échelle : H1 `clamp(40px,6vw,72px)` · H2 `clamp(30px,4vw,46px)` · H3 19–32px · body 15–19px · méta 13–14.5px · eyebrow 13px uppercase letter-spacing 0.16em

**Rayons** : 4px (boutons, chips), 6px (cartes, photos), 8px (panneau CTA final)

**Espacements** : rythme vertical par sections ~104px (padding-top) ; gouttières 40px ; gaps de grille 20px ; padding cartes 24–48px.

**Ombres** : quasi absentes (parti pris du brief). Seule ombre douce sur le dropdown : `0 12px 34px -18px rgba(33,28,23,0.28)`.

## Assets
- **Logo** : logotype ACRE existant, à conserver en l'état — `https://acre-renovation.fr/wp-content/uploads/2026/07/cropped-logo-ACRE.jpg`. Dans le prototype il est rendu en texte « ACRE. » ; utiliser le vrai fichier logo dans le site.
- **Photos de chantier** : placeholders (`<image-slot>`) — à remplacer par de vraies photos géolocalisées (hero pleine largeur, 5 expertises, 4 réalisations). C'est le premier matériau visuel : grandes surfaces, cadrages généreux, peu d'habillage.
- **Fonts** : Google Fonts (Bricolage Grotesque, Hanken Grotesk) — importer via `<link>` ou self-host.
- **Carte zone d'intervention** : SVG décoratif inline dans le prototype ; peut être remplacé par une vraie carte stylisée sobre.

## Files
- `Accueil.dc.html` — le prototype complet de la page d'accueil (markup + styles inline + logique dropdown/mobile).

> Note : ignorer le runtime `<x-dc>` / `support.js` / `image-slot` — ne porter que le markup, les styles inline et les comportements décrits ci-dessus.
