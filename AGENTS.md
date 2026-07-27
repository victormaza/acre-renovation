# Acre Rénovation — contexte projet

Refonte du site d'une entreprise de rénovation en Gironde.
Dépôt : `victormaza/acre-renovation` (compte perso, **pas** l'organisation Artishoc).
Domaine cible : `acre-renovation.fr`

---

## Stack

| Couche | Choix |
|---|---|
| Front | Astro, génération statique |
| CSS | CSS moderne, pas de framework lourd |
| CMS | Prismic — plan gratuit, **1 utilisateur**, accès partagé avec le client |
| Modélisation | UI Prismic + sync JSON en Git par script (`types:pull` / `types:push`) |
| Hébergement | Cloudflare Workers Static Assets |
| Ancien hébergeur | LWS — conservé pour le domaine et les emails uniquement |

### Pourquoi ces choix

- **Prismic plutôt que Sveltia CMS** : évite d'imposer un compte GitHub au client, et fournit une médiathèque + un CDN d'images natif. Le site repose sur un gros volume de photos avant/après, que l'on ne veut pas versionner dans le dépôt.
- **Prismic plutôt que Strapi** : pas de serveur Node ni de base de données à maintenir, pas de stockage S3/R2 à câbler, pas de migration de version majeure à subir.
- **Contentful et Strapi Cloud écartés** : coût récurrent disproportionné pour un site vitrine de TPE.
- **Prismic est français** : interface et support en FR, ce qui compte pour ce client.

---

## État actuel

- [x] Projet Prismic créé — dépôt **`3u0gsum3`**, et non `acre-renovation` : c'est le sous-domaine de l'API de contenu *et* la valeur de l'en-tête `repository`. Créé depuis un starter, donc livré avec des types et slices anglais à nettoyer.
- [x] Projet Astro initialisé en local
- [x] Dépôt Git poussé sur GitHub
- [x] Cloudflare Workers connecté au dépôt
- [x] Sauvegarde des URLs de l'ancien site récupérée (crawl)
- [x] Home issue de Claude Design intégrée (en local, pas encore déployée)
- [x] Client Prismic et synchro du schéma câblés
- [x] Chaîne Prismic → build → HTML validée de bout en bout sur le slice `hero`
- [ ] Modèle de contenu — 7 slices restants (`reassurance`, `expertises`, `realisations`, `zone_intervention`, `methode`, `guides`, `cta_final`) et les types repeatable
- [ ] Locale `en-us` à supprimer — bloquée tant que les 2 documents du starter en `en-us` existent
- [ ] Sections encore en dur dans `index.astro` (tout sauf le Hero)
- [ ] Plan de redirections 301

### Configuration Cloudflare

Build command : `npm run build`
Deploy command : `npx wrangler deploy`
Builds sur branches non-production : activés (donne les previews de PR)

`wrangler.jsonc` à la racine du dépôt :

```jsonc
{
  "name": "acre-renovation",
  "compatibility_date": "2026-07-27",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

Pas de clé `main` : Worker purement statique, aucun point d'entrée nécessaire.

**Le domaine n'est pas encore branché** — l'ancien site doit rester en ligne jusqu'à la bascule. Le déploiement vit sur l'URL `.workers.dev` en attendant.

---

## Prochaine étape immédiate

Intégrer la home produite par Claude Design, **découpée en composants**.

Ce découpage n'est pas cosmétique : il définit le schéma de slices Prismic. Chaque section visuelle devient un composant qui **reçoit son contenu en props**, même si les valeurs sont codées en dur dans `index.astro` pour l'instant. Le jour où Prismic est branché, seule la source des props change ; le markup n'est pas retouché.

Découpage réalisé, dérivé du handoff `design_handoff_accueil/` :

```
src/
  layouts/Base.astro          ← <head>, SEO, Header, Footer, StickyCta
  components/
    Header.astro              ← nav + dropdown + burger
    Hero.astro                → futur slice
    Reassurance.astro         → futur slice
    Expertises.astro          → futur slice
    Realisations.astro        → futur slice
    ZoneIntervention.astro    → futur slice
    Methode.astro             → futur slice
    Guides.astro              → futur slice
    CtaFinal.astro            → futur slice
    Footer.astro
    StickyCta.astro
    SectionHead.astro         ← eyebrow + H2 + lien, mutualisé
    Photo.astro               ← emplacement image, futur <PrismicImage>
  data/settings.ts            ← nav, footer, CTA — futur single `settings`
  styles/global.css           ← tokens, reset, boutons, conteneur
  pages/index.astro           ← contenus en dur + assemblage
```

Le reste du CSS reste scoped dans chaque `.astro`.

Il n'y a **pas** de section témoignages dans le design livré, contrairement à ce qui était supposé au départ.

**Critère de fin d'étape** : la home est en ligne sur l'URL Cloudflare, fidèle au rendu Claude Design, entièrement pilotée par props. On ne lance Slice Machine qu'après — la liste des slices est alors dérivée du design réel, pas devinée.

### Écarts assumés par rapport au handoff

- Le handoff mentionne « Astro + Sveltia CMS sur Cloudflare Pages » : c'est l'ancienne cible technique, à ignorer. Prismic + Workers font foi.
- **Polices self-hostées** via `@fontsource-variable` plutôt que le `<link>` Google Fonts du prototype : évite la requête tierce (RGPD) et le retard de rendu.
- **Barre CTA collante et dropdown** en CSS (media query, `aria-expanded`) plutôt qu'en JS `matchMedia` : pas de flash au chargement sur un site statique. Le JS restant ne sert qu'au burger et à l'état ARIA.
- **Logo** conservé en logotype texte « ACRE. ». Le fichier fourni est un JPG WordPress ; à remplacer par un SVG le jour où on l'a.
- **Menu mobile** : le prototype n'en fournissait pas, le handoff demandait « un burger accessible ». Implémenté au plus sobre, avec les sous-liens expertises dépliables.
- Ponctuation française : espaces insécables avant `? :` et entre nombre et unité. Sans ça, « Un projet en tête ? » coupait avant le point d'interrogation.

---

## Modèle de contenu

### Slice Machine ne supporte pas Astro

Vérifié en juillet 2026 : les adaptateurs Slice Machine n'existent que pour Next, Nuxt et SvelteKit. `@slicemachine/adapter-astro` et `@prismicio/astro` n'existent pas sur npm. La demande d'intégration Astro est ouverte côté communauté Prismic, sans réponse.

**Conséquence** : on modélise dans l'interface web de Prismic, puis on rapatrie le JSON dans le dépôt.

```bash
npm run types:pull   # Prismic → Git, après modélisation dans l'UI
npm run types:push   # Git → Prismic, après édition du JSON à la main
```

> **Règle** : le JSON de `customtypes/` et `src/slices/` reste la source de vérité versionnée. Toute modélisation faite dans l'UI doit être suivie d'un `types:pull` et d'un commit, sinon le dépôt ment. C'est la discipline qui remplace la garantie que donnait Slice Machine.

Le script est dans `scripts/prismic-types.mjs` et s'appuie sur `@prismicio/custom-types-client`. Il demande `PRISMIC_CUSTOM_TYPES_TOKEN` dans `.env` (voir `.env.example`) ; ce jeton ne sert qu'à la synchro du schéma, pas au build.

L'arborescence des fichiers suit quand même la convention Slice Machine (`customtypes/<id>/index.json`, `src/slices/<id>/model.json`) : si un adaptateur Astro sort un jour, la reprise est immédiate.

**Types repeatable** — `realisation`, `guide`, `page_ville`, `expertise`
**Types single** — `homepage`, `contact`, `settings` (coordonnées, nav, footer, valeurs SEO par défaut)

Points de structure :

- Champ **UID** sur chaque type repeatable : c'est lui qui pilote les routes Astro.
- Liens `realisation → expertise` et `realisation → page_ville` en **Content Relationship**, pas en texte libre. Permet les listings croisés (« nos réalisations à Libourne », « nos chantiers d'isolation ») sans ressaisie ni faute de frappe côté client.
- **Avant/après** : un champ **Group** répétable contenant deux images + une légende. Le client ajoute autant de paires qu'il veut, et la section reste optionnelle.

---

## Intégration Prismic dans Astro

- `src/prismicio.ts` : `createClient` + config `routes` mappant type et UID vers les chemins d'URL.
- Génération statique classique : `getStaticPaths()` alimenté par `client.getAllByType('realisation')`.
- **Slice zone** : pas de `<SliceZone>` officiel pour Astro, `src/components/SliceZone.astro` le remplace. Une slice publiée mais pas encore codée est ignorée plutôt que de casser le build.
- **Adaptateurs de slices** : `src/slices/<id>/index.astro` traduit les champs Prismic en props du composant correspondant de `src/components/`. Le markup n'est jamais touché par Prismic — c'est ce qui rend le découpage en props utile.
- **Images** : `@prismicio/client` expose `asImageWidthSrcSet`, qui produit `src` + `srcset` avec les paramètres imgix du CDN Prismic (`auto=format,compress`, `width=`). Tout passe par `src/components/Photo.astro`, seul fichier du site qui sait d'où vient une image. C'est le mécanisme qui règle le problème du volume de photos.

### Webhook de rebuild

Créer un Deploy Hook côté Cloudflare, coller son URL dans Prismic → Settings → Webhooks, déclencheur sur publication.

### Previews — écartées pour l'instant

Prismic propose des aperçus de brouillons, mais cela suppose une route rendue à la demande, qu'un site 100 % statique n'a pas.

**Décision : on part sans preview.** Workflow « je publie, je regarde, je corrige ». Le site reste donc 100 % statique, sans adapter Cloudflare ni clé `main` dans `wrangler.jsonc`.

Réversible : monter la route hybride plus tard suppose d'ajouter l'adapter Cloudflare, de passer la seule route de preview en rendu à la demande, et d'ajouter `main` à `wrangler.jsonc`. À rouvrir si le client vit mal l'absence d'aperçu — c'est le motif d'insatisfaction le plus fréquent chez un utilisateur non technique.

---

## Garde-fous

### Compte Prismic partagé

Le plan gratuit est limité à 1 utilisateur, donc l'identifiant est partagé avec le client. Conséquences assumées : aucune traçabilité des modifications, aucune révocation sélective, et perte d'accès si le client change le mot de passe. Acceptable à cette échelle, à condition que ce soit documenté. Le passage au premier palier payant (~10-15 €/mois) règle le problème le jour où ça frotte.

### Sauvegarde du contenu

Le contenu sort de Git — c'est le prix payé pour Prismic. À compenser par un script qui interroge l'API Prismic, dump le JSON de tous les documents et le commite dans le dépôt, planifié une fois par semaine en GitHub Action. Environ 30 minutes de travail.

---

## Migration et redirections

Il n'y a **pas de Search Console** sur l'ancien site, d'où le crawl préalable.

Sources d'URLs consolidées : crawl direct, `/sitemap.xml` s'il existe, et l'API CDX de Wayback Machine pour récupérer les URLs historiquement indexées mais plus liées depuis la navigation :

```
http://web.archive.org/cdx/search/cdx?url=acre-renovation.fr*&output=text&fl=original&collapse=urlkey
```

Le mapping `ancienne_url ; nouvelle_url` alimente `public/_redirects`.

**Créer `public/_redirects` dès le premier commit, même vide**, pour qu'il ne soit pas oublié au moment de la bascule. Workers Static Assets lit `_redirects` et `_headers` depuis `dist/` avec les mêmes règles que Cloudflare Pages, code `301` inclus.

---

## Points ouverts

- Arborescence cible définitive du site (conditionne les custom types)
- Contenu des pages villes : quelles villes, quel niveau de spécificité par page
- Date de bascule DNS et fenêtre de recouvrement avec l'ancien site