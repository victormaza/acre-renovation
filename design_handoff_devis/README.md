# Handoff : Configurateur de demande de devis — Acre Rénovation

## Overview
Page la plus stratégique du site : un configurateur en **5 étapes + écran de confirmation** qui transforme un visiteur en lead qualifié envoyé par **email** à Acre Rénovation. Pas de CRM ni base de données. Trafic majoritairement **mobile**. Objectif : lever les freins (effort perçu, méfiance, peur de s'engager) et maximiser le taux de complétion.

S'inscrit dans l'**identité déjà validée sur la page d'accueil** (même palette, typo, composants) — ne pas réinventer de direction artistique.

Cible technique du projet réel : **Astro**, logique de configurateur en **JavaScript léger** (aucun framework lourd imposé par le design), contenus via Prismic, hébergé Cloudflare Pages. Envoi par email, sans back-office.

## About the Design Files
`Devis.dc.html` est une **référence de design en HTML** — un prototype fonctionnel montrant l'apparence, le parcours et les états, **pas du code de production**. La tâche : **recréer ce configurateur dans Astro** avec du JS vanilla léger, en suivant les conventions du repo. Le HTML utilise un runtime interne (`support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`) qui ne doit **pas** être porté — ne reprendre que le markup, les styles inline et la logique décrite ci-dessous.

## Fidelity
**High-fidelity (hifi).** Couleurs, typo, espacements, radius et états d'interaction sont définitifs, alignés sur la page d'accueil. Recréer au pixel près.

## Layout général
- Coquille centrée, largeur max **680px**, gouttières `clamp(20px, 5vw, 40px)`, fond global `#fbfaf7`.
- **Header** simple (72px) : logotype « ACRE. » (point `#e47b02`) à gauche, lien « ← Retour au site » à droite.
- **En-tête de progression persistant** (étapes 1–5, masqué sur la confirmation) : bouton « ← Retour » (dès l'étape 2), libellé « Demande de devis » (étape 1 seulement), compteur « Étape X sur 5 », puis **barre de progression** (piste `#ece6da`, remplissage `#e47b02`, `transition: width .4s`).
- **Bandeau de réassurance persistant** en bas (masqué sur confirmation) : « Sans engagement · Réponse sous 48 h · Garantie décennale » (puces `#e47b02`).
- Chaque changement d'étape : animation `acre-fade` (fondu + translup 10px, .32s) et `scrollTo(top)`.

## Le parcours (états & vues)

### Étape 1 — Type de projet
5 **cartes larges cliquables** (choix unique). Chaque carte : badge numéro `01`–`05` (carré 38px, fond `#f2eee5`/texte muted ; **actif** → fond `#e47b02`, texte `#211410`), libellé (Bricolage 18px) + sous-libellé (14px `#7a7162`), chevron `→`. **Le clic sélectionne ET avance à l'étape 2** (pas de bouton « suivant »).
Options : Rénovation globale · Extension ou surélévation · Piscine ou aménagement extérieur · Rénovation cuisine ou salle de bain · Aménagement intérieur sur-mesure.

### Étape 2 — Le bien & la surface
- **Type de bien** : 2 gros boutons (grille 2 col.) Maison / Appartement.
- **Surface** : 5 chips (`minmax(140px,1fr)`) — Moins de 50 m² · 50–100 · 100–150 · 150–200 · Plus de 200 m².
- Bouton **« Continuer → »** (plein sombre), désactivé tant que type + surface non renseignés.

### Étape 3 — Localisation
- Champ texte « Ville ou code postal ».
- **Puces de villes** (Bordeaux, Mérignac, Pessac, Andernos, Cap Ferret, Arcachon) qui pré-remplissent le champ.
- **Message doux hors-zone** (non bloquant) : encadré ambré `#f7f0e4`/`#ecd9b8` invitant à envoyer quand même. Logique : afficher si l'entrée **n'est pas** reconnue en zone ET (code postal 5 chiffres **ou** nom ≥ 4 caractères). « En zone » = nom présent dans la liste `IN_ZONE` (communes de Bordeaux Métropole + Bassin d'Arcachon) **ou** code postal commençant par 33/40/47.
- Bouton « Continuer → », désactivé si < 2 caractères.

### Étape 4 — Budget & échéance
- **Budget** : 5 chips (`minmax(150px,1fr)`) — Moins de 30 k€ · 30–60 · 60–100 · 100–200 · Plus de 200 k€.
- **Échéance** : 3 lignes-radio (puce ronde + libellé + hint à droite) — Dès que possible / Dans 3 à 6 mois / Je me renseigne. **Filtre le plus qualifiant : à soigner autant que le budget.**
- Bouton « Continuer → », désactivé si budget + échéance non renseignés.

### Étape 5 — Coordonnées & finalisation
- **Récapitulatif discret** des choix précédents (chips dans un bloc `#f2eee5`) pour rassurer avant l'envoi.
- Champs : Prénom / Nom (grille 2 col.), Email, Téléphone, Description (textarea, facultatif), **dépôt de photos** optionnel.
- **Photos** : zone drag/upload pointillée (`image/*,.pdf`, multiple), liste des fichiers sélectionnés avec nom + taille + suppression, **max 8 fichiers, 10 Mo/fichier**.
- **Consentement RGPD** : case à cocher (accent `#e47b02`) + lien politique de confidentialité.
- Bouton **« Envoyer ma demande »** (plein **orange**), avec état *envoi en cours* (spinner `acre-spin` + « Envoi en cours… »).

### Écran de confirmation
Pastille verte ✓, titre « Demande envoyée, merci {prénom} ! », rappel du **délai 48 h ouvrées**, double CTA vers Réalisations / Guides (**pas de cul-de-sac**). En-tête de progression et bandeau masqués.

## State Management
Logique JS légère (aucun back). État à recréer :
- `step` : 1–5, `6` = confirmation.
- `projectType`, `propertyType`, `surface`, `location`, `budget`, `timing` — sélections.
- `firstName`, `lastName`, `email`, `phone`, `description`, `files[]`, `consent`.
- Erreurs : `emailError`, `phoneError`, `contactError` ; drapeaux `sending`, `sendFailed`.

**Validation** :
- Email : regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Téléphone : ≥ 9 chiffres (après nettoyage `[^\d+]`). Validés au `blur`.
- **Seule contrainte réelle à l'étape 5** : prénom rempli **ET** (email valide **OU** téléphone valide) **ET** consentement coché. Aucun autre champ obligatoire (moins de friction = moins d'abandon).
- Bouton d'envoi désactivé tant que ces conditions ne sont pas réunies.

**Envoi** : dans le prototype, simulé par un `setTimeout` de 1,4 s qui bascule vers la confirmation. **À remplacer** par l'envoi email réel (ex. endpoint Astro / fonction Cloudflare + service mail) ; prévoir le rendu de l'état `sendFailed` (encadré rouge + bouton « Réessayer »).

## Accessibilité (exigée)
- Navigation clavier complète, `:focus-visible` visible (`outline: 2px solid #e47b02`).
- `<label for>` associés à chaque champ, messages d'erreur explicites en texte.
- Contrastes AA, zones tactiles larges (mobile-first).

## Design Tokens (identiques à la page d'accueil)
**Couleurs** : fond `#fbfaf7` · alterné `#f2eee5` · surfaces sombres/encre `#211c17` · texte `#554e42` · secondaire `#7a7162` · muted `#8a8070`/`#a99f8d`/`#b1a795` · bordures `#ece6da`/`#e7e0d3`/`#eae3d6`/`#e2daca`/`#d8d1c3` · **accent `#e47b02`** (hover `#f38a15`, liens hover `#b85e04`, texte sur orange `#211410`) · sur sombre `#f7f3ec`.
États : sélection = bordure `#e47b02` + fond `#fff` ; option inactive = fond `#fdfcf9`, bordure `#e7e0d3`. Erreur : texte `#b3401a`, encadré `#fbeae4`/`#f0c9ba`, input bordure `#d98b6a`. Hors-zone : `#f7f0e4`/`#ecd9b8`. Succès : `#e9f2e6`/`#cfe3c7`, ✓ `#3f7d32`.

**Typo** : titres **Bricolage Grotesque** (600, letter-spacing ~-0.015em) ; texte **Hanken Grotesk** (400/500/600). H1 d'étape `clamp(26px,4vw,36px)`.

**Radius** : 4px (boutons plein), 6px (champs, chips, cartes secondaires), 8px (cartes projet actives), 999px (puces).
**Ombres** : quasi aucune (parti pris). Séparations par contraste de surfaces + bordures.

## Files
- `Devis.dc.html` — prototype complet du configurateur (5 étapes + confirmation, markup + styles inline + logique).

> Ignorer le runtime `<x-dc>` / `<sc-*>` / `support.js` — ne porter que markup, styles et logique décrits ci-dessus.
