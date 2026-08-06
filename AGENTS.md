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
| Hébergement | Cloudflare Workers Static Assets + une route à la demande |
| Envoi d'emails | Brevo (API HTTP transactionnelle) |
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
- [x] Home issue de Claude Design intégrée, fusionnée sur `main` et déployée sur l'URL `.workers.dev`
- [x] Client Prismic et synchro du schéma câblés
- [x] Chaîne Prismic → build → HTML validée de bout en bout sur le slice `hero`
- [x] Les 8 slices de la home modélisés, poussés et branchés — `index.astro` ne contient plus aucun contenu
- [x] Les 8 sections de la home saisies dans le document `homepage`
- [x] Types repeatable `expertise`, `realisation`, `guide` créés — les slices de listing pointent vers les documents au lieu de les recopier
- [x] Configurateur de devis `/devis` intégré, branché sur `/api/devis` et Brevo
- [x] Slice `avis` créée — avis Google recopiés à la main dans Prismic
- [x] Webhook de rebuild branché — publier dans Prismic déclenche un build Cloudflare
- [ ] **Créer le compte Brevo, valider `contact@acre-sas.fr` comme expéditeur et poser `BREVO_API_KEY`** — sans ça, `/devis` affiche « le formulaire n'est pas encore configuré »
- [x] Adresses email confirmées : `contact@acre-sas.fr` en expéditeur *et* en destinataire
- [ ] Saisir les premiers documents `expertise`, `realisation` et `guide` : les trois sections de la home sont masquées tant qu'ils n'existent pas
- [ ] Saisir les avis dans la slice `avis` et l'ajouter à la home : la section est masquée tant qu'aucun avis n'est saisi
- [ ] Gabarits de pages `/expertises/:uid`, `/realisations/:uid`, `/guides/:uid` — les cartes de la home pointent déjà dessus
- [ ] Type repeatable `page_ville`
- [ ] Locale `en-us` à supprimer — bloquée par le document `homepage` en `en-us`
- [ ] Plan de redirections 301

### Configuration Cloudflare

Build command : `npm run build`
Deploy command : `npx wrangler deploy`
Builds sur branches non-production : activés (donne les previews de PR)

**Le site n'est plus purement statique depuis l'ouverture du formulaire de devis.**
`src/pages/api/devis.ts` est la seule route rendue à la demande (`prerender = false`) ;
toutes les pages restent prérendues et servies en assets. D'où `@astrojs/cloudflare`
dans `astro.config.mjs`.

Conséquence sur le déploiement : **on ne déploie plus avec le `wrangler.jsonc` de la
racine**, mais avec celui que l'adapter en dérive au build, dans `dist/server/`.
C'est lui qui porte `main`, le binding `ASSETS` et le bon `assets.directory`.
`npm run deploy` enchaîne les deux.

Le `-c dist/server/wrangler.json` du script npm est une **ceinture, pas une
nécessité** : l'adapter écrit aussi `.wrangler/deploy/config.json`, un fichier de
redirection que `wrangler deploy` lit tout seul. D'où la commande courte côté
Cloudflare, vérifiée dans le log de build du 6 août 2026 :

```
Using redirected Wrangler configuration.
 - Configuration being used: "dist/server/wrangler.json"
 - Original user's configuration: "wrangler.jsonc"
 - Deploy configuration file: ".wrangler/deploy/config.json"
```

Ne pas « corriger » le dashboard pour y remettre le `-c` en croyant réparer
quelque chose : les deux formes déploient le même Worker, route `/api/devis`
comprise.

Ne pas ajouter de clé `main` dans le `wrangler.jsonc` de la racine : le plugin Vite
de Cloudflare cherche à la résoudre au démarrage du build, avant que `dist/` existe,
et le build échoue.

Deux réglages de l'adapter méritent d'être connus, tous deux là pour éviter que
Cloudflare provisionne des ressources dont le site ne se sert pas :

- `imageService: 'passthrough'` — aucune image ne passe par `astro:assets`, elles
  viennent toutes du CDN Prismic via `Photo.astro`. Sans ça, un binding Cloudflare
  Images est réclamé.
- `session: { driver: sessionDrivers.null() }` — la route de devis est un POST sans
  état. Sans ça, un namespace KV est créé au déploiement pour rien.

### URLs sans slash final

`trailingSlash: 'never'` côté Astro et `html_handling: 'drop-trailing-slash'` côté
assets Cloudflare. Les deux doivent rester d'accord : c'est la forme que produit
déjà la table de routes Prismic, et celle que viseront les redirections 301.

**Le domaine n'est pas encore branché** — l'ancien site doit rester en ligne jusqu'à la bascule. Le déploiement vit sur l'URL `.workers.dev` en attendant.

---

## Prochaine étape immédiate

Intégrer la home produite par Claude Design, **découpée en composants**.

Ce découpage n'est pas cosmétique : il définit le schéma de slices Prismic. Chaque section visuelle devient un composant qui **reçoit son contenu en props**, même si les valeurs sont codées en dur dans `index.astro` pour l'instant. Le jour où Prismic est branché, seule la source des props change ; le markup n'est pas retouché.

Découpage réalisé, dérivé du handoff Claude Design de l'accueil (retiré du dépôt
une fois l'intégration faite — le code livré fait foi) :

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

### Slices de listing — le contenu vient des documents

Les slices `expertises`, `realisations` et `guides` ne stockent **aucun contenu de carte**. Elles gardent leur surtitre, leur titre, leur lien « voir tout », et une liste de **Content Relationship** vers les documents à afficher. Le client crée une fiche une seule fois : titre, photo et extrait de la home suivent la fiche, sans recopie ni désynchronisation.

Le repli est le mode par défaut : **liste vide = les derniers documents publiés** (4 réalisations, 3 guides, toutes les expertises par ordre de création). Publier une réalisation suffit donc à la faire apparaître ; la sélection manuelle ne sert qu'à forcer un ordre ou une vitrine précise.

La mécanique tient dans `resolvePicks()` (`src/prismicio.ts`), appelée par les trois adaptateurs.

Deux comportements à connaître :

- **Une section sans document ne s'affiche pas du tout** — plutôt qu'un titre suivi d'une grille vide, qui passait inaperçu au build comme en relecture.
- Pour `expertises`, **la première de la liste occupe la grande carte**. Réordonner dans Prismic change donc la mise en avant et renumérote les cartes. L'ancre reste dérivée du titre via `slugify()`, parce que c'est elle que vise le menu déroulant de `src/data/settings.ts` — pas l'UID.

### Avis Google — recopiés, pas synchronisés

La slice `avis` porte les avis eux-mêmes : auteur, note (Select 5→1), texte, date,
plus une note globale et un lien vers la fiche Google. **Aucun appel à Google.**

C'est un choix, pas un renoncement provisoire. Les trois voies automatiques ont
été écartées en août 2026 :

- **Places API (New)** — renvoie **5 avis maximum**, triés par *pertinence*, sans
  paramètre de tri ni pagination : la demande est ouverte chez Google depuis 2015.
  « Les derniers avis » n'est donc pas réalisable par cette voie. Le champ `reviews`
  bascule en outre l'appel dans le SKU *Place Details Enterprise + Atmosphere*
  (~40 $/1000, 1 000 appels gratuits par mois) et suppose un compte Google Cloud
  avec carte bancaire.
- **Business Profile API** — donne tous les avis, vraiment chronologiques, et
  gratuitement, mais exige un OAuth sur la fiche du client, une demande de quota
  validée par Google et un refresh token à maintenir.
- **Widgets tiers** (Elfsight, Trustindex) — du JS tiers qui appelle Google au
  chargement, à rebours du choix de polices self-hostées pour le RGPD.

Les CGU Maps demandent par ailleurs que les avis servis par l'API soient affichés
avec attribution Google et non entreposés (plafond de cache : 30 jours), ce qui
cadre mal avec un HTML statique figé au build.

À rouvrir si le volume d'avis rend la recopie pénible — la Business Profile API
est alors la bonne porte, pas la Places API.

⚠️ **Ne pas ajouter de balisage `AggregateRating` sur ces avis.** Google traite le
balisage d'avis auto-déclarés sur sa propre entité comme du contenu auto-promotionnel
et ne l'affiche pas en résultat enrichi ; le risque d'action manuelle est réel.

**Types repeatable** — `realisation`, `guide`, `expertise` (créés), `page_ville` (à venir)
**Types single** — `homepage`, `contact`, `settings` (coordonnées, nav, footer, valeurs SEO par défaut)

Points de structure :

- Champ **UID** sur chaque type repeatable : c'est lui qui pilote les routes Astro.
- Liens `realisation → expertise` et `realisation → page_ville` en **Content Relationship**, pas en texte libre. Permet les listings croisés (« nos réalisations à Libourne », « nos chantiers d'isolation ») sans ressaisie ni faute de frappe côté client.
- **Avant/après** : un champ **Group** répétable contenant deux images + une légende. Le client ajoute autant de paires qu'il veut, et la section reste optionnelle.

---

## Intégration Prismic dans Astro

- `src/prismicio.ts` : `createClient` + config `routes` mappant type et UID vers les chemins d'URL. **`createClient` est asynchrone** : l'API de contenu n'annonce un type qu'à partir de son premier document et rejette toute la table de routes si l'un des types cités lui est inconnu — déclarer `realisation` avant la première réalisation publiée faisait échouer jusqu'à la requête de la home. La table est donc filtrée à la volée contre les types réellement présents, et chaque route s'active d'elle-même quand le contenu arrive.
- Génération statique classique : `getStaticPaths()` alimenté par `client.getAllByType('realisation')`.
- **Slice zone** : pas de `<SliceZone>` officiel pour Astro, `src/components/SliceZone.astro` le remplace. Une slice publiée mais pas encore codée est ignorée plutôt que de casser le build.
- **Adaptateurs de slices** : `src/slices/<id>/index.astro` traduit les champs Prismic en props du composant correspondant de `src/components/`. Le markup n'est jamais touché par Prismic — c'est ce qui rend le découpage en props utile.
- **Images** : `@prismicio/client` expose `asImageWidthSrcSet`, qui produit `src` + `srcset` avec les paramètres imgix du CDN Prismic (`auto=format,compress`, `width=`). Tout passe par `src/components/Photo.astro`, seul fichier du site qui sait d'où vient une image. C'est le mécanisme qui règle le problème du volume de photos.

---

## Formulaire de devis

Dérivé du handoff Claude Design du devis, lui aussi retiré du dépôt après
intégration. Cinq étapes plus un écran de
confirmation, sur `/devis`, hors du gabarit du site : ni navigation, ni pied de
page, ni barre CTA — d'où le drapeau `bare` de `Base.astro` et le composant
`FunnelHeader.astro`, qui ne laisse qu'une seule sortie.

```
src/
  pages/devis.astro           ← coquille 680px + FunnelHeader
  pages/devis/merci.astro     ← confirmation pour le parcours sans JS
  pages/api/devis.ts          ← seule route `prerender = false`, envoi Brevo
  components/DevisForm.astro  ← markup, styles et logique des 5 étapes
  components/FunnelHeader.astro
  data/devis.ts               ← options, zone d'intervention, textes
```

### Un vrai formulaire, replié par le JavaScript

Le markup rendu est **un seul `<form>` contenant les cinq étapes**, qui sait poster
tout seul vers `/api/devis`. Le script se contente de le replier en parcours guidé :
il masque les étapes, révèle la progression et les boutons « Continuer », et
remplace l'envoi natif par un `fetch`.

Tout l'affichage conditionnel passe donc par l'attribut `hidden` **posé dans le
markup**, pas ajouté par le script : rien ne scintille au chargement, et aucun
bouton n'est mort si le script ne part pas. Sans JavaScript, les cinq étapes
s'affichent à la suite et l'envoi natif atterrit sur `/devis/merci`.

Deux pièges rencontrés, tous deux invisibles au build :

- **`[hidden]` perd contre `display`.** Presque chaque bloc masquable reçoit un
  `display` dans la feuille du composant, qui l'emporte sur la règle par défaut
  du navigateur. D'où le `[hidden] { display: none !important }` en tête des
  styles — sans lui, les éléments « masqués » restent à l'écran.
- **Les éléments créés en JS échappent au CSS scopé d'Astro.** Les puces du
  récapitulatif n'ont pas l'attribut de portée ajouté au markup rendu : leur règle
  doit passer par `:global()`.

### Les options sont des radios, pas des boutons

Le prototype pilotait la sélection en JS. Ici chaque option est un
`<input type="radio">` masqué dans son `<label>` : navigation aux flèches,
groupement annoncé et envoi sans JS viennent gratuitement, et l'état sélectionné
tient dans `:has(input:checked)` sans une ligne de script.

### Règles de validation

Volontairement peu exigeantes — chaque champ obligatoire de plus est un abandon de
plus. **Prénom, puis un email valide *ou* un téléphone valide, plus le
consentement.** Rien d'autre n'est requis, description comprise. Les mêmes règles
sont réappliquées côté serveur.

Le message « hors zone » de l'étape 3 est **informatif et ne bloque jamais l'envoi** :
il invite à envoyer quand même. La zone est décrite dans `data/devis.ts`
(`inZoneCities`, `inZonePostalPrefixes`) et sert aussi à marquer la demande
« hors zone habituelle » dans l'email, pour le tri côté client.

### Ce que le serveur fait de la demande

`src/pages/api/devis.ts` répond selon le canal : JSON pour le `fetch` du
configurateur, redirection 303 vers `/devis/merci` pour l'envoi natif.

- Les listes de `data/devis.ts` servent de **référentiel** : une valeur de choix
  qui n'en vient pas est jetée, pas relayée dans la boîte du client.
- **Pot de miel** (`societe`) et **délai minimal de remplissage** (3 s) : les deux
  répondent 200 sans rien envoyer, pour ne rien apprendre à l'émetteur.
- Le `replyTo` de l'email porte l'adresse du prospect : répondre depuis la boîte
  du client tombe directement chez lui.
- La protection CSRF d'Astro (`security.checkOrigin`) rejette les POST de
  formulaire sans en-tête `Origin` — attendu, mais à savoir si l'on teste au curl.

### Configuration Brevo

Trois variables, lues à l'exécution dans l'environnement du Worker via `astro:env` :

| Variable | Où | Rôle |
|---|---|---|
| `BREVO_API_KEY` | `wrangler secret put` | Clé de l'API transactionnelle |
| `DEVIS_TO_EMAIL` | `vars` de `wrangler.jsonc` | Boîte qui reçoit les demandes |
| `DEVIS_FROM_EMAIL` | `vars` de `wrangler.jsonc` | Expéditeur, **validé côté Brevo** |

**Les deux adresses valent `contact@acre-sas.fr`** : le client ne veut qu'une seule
adresse sur ce parcours. L'email part donc de la boîte qui le reçoit. Sans effet
sur la réponse au prospect, le `replyTo` portant son adresse à lui.

En local, les trois viennent de `.env` (voir `.env.example`). Tant que la clé
manque, la route répond 500 avec un message explicite plutôt que de planter.

⚠️ L'expéditeur est sur **`acre-sas.fr`**, pas sur `acre-renovation.fr` : c'est ce
domaine-là qu'il faut authentifier chez Brevo (SPF/DKIM), et son DNS peut être
ailleurs que chez LWS. Les enregistrements peuvent être posés dès maintenant sans
toucher au site en ligne.

### Photos écartées en v1

Le handoff prévoit un dépôt de fichiers (8 fichiers, 10 Mo chacun). Retiré :
80 Mo ne passent dans aucun email, et le stockage intermédiaire (R2, rétention,
accès aux photos de clients) coûtait plus que ce que la v1 devait porter. À
rouvrir si le client réclame les plans en pièce jointe.

### Webhook de rebuild

Branché le 6 août 2026. Publier dans Prismic déclenche un build Cloudflare, sans
intervention.

| Bout | Où | Nom |
|---|---|---|
| Deploy Hook | Cloudflare → Worker `acre-renovation` → Settings → Builds → Deploy Hooks | `prismic-publication`, branche `main` |
| Webhook | Prismic → Settings → Webhooks | `Rebuild Cloudflare (main)` |

Les Deploy Hooks n'existaient que pour Pages jusqu'en avril 2026 ; Workers Builds
les a depuis. Le hook est lié à **une branche**, d'où le nom : un hook pour `main`,
et rien d'autre à brancher tant qu'il n'y a qu'une cible de production.

⚠️ **L'URL du hook est un secret** — qui l'a peut déclencher des builds. Elle n'est
donc pas dans le dépôt : elle se relit dans le dashboard Cloudflare, et se révoque
en supprimant le hook.

**Seuls les deux déclencheurs `Documents` sont cochés** côté Prismic (publication et
dépublication). Les déclencheurs `Releases` et `Tags` sont décochés à dessein : ils
ne changent rien au HTML rendu et consommeraient du quota de build — 3 000 minutes
par mois sur le plan gratuit — pour reconstruire à l'identique. Publier une release
publie ses documents, donc le cas reste couvert.

Limites à connaître : 10 builds/minute par Worker, 100/minute par compte. Sans
objet à ce rythme de publication, mais c'est le plafond qui tomberait le jour d'une
reprise de contenu en masse.

Pour tester sans publier : bouton **Trigger it** de la ligne du webhook, puis
onglet **Logs** de Prismic (on attend `200`) et l'historique des builds côté
Cloudflare.

### Previews — écartées pour l'instant

Prismic propose des aperçus de brouillons, mais cela suppose une route rendue à la demande, qu'un site 100 % statique n'a pas.

**Décision : on part sans preview.** Workflow « je publie, je regarde, je corrige ».

⚠️ **Le motif d'origine ne tient plus.** On écartait les previews parce qu'elles
supposaient un adapter Cloudflare et une route rendue à la demande, que le site
n'avait pas. Le formulaire de devis a apporté les deux. Il ne reste qu'à écrire la
route de preview et à la marquer `prerender = false` — l'infrastructure est déjà là.

À rouvrir si le client vit mal l'absence d'aperçu : c'est le motif d'insatisfaction
le plus fréquent chez un utilisateur non technique, et le coût vient de tomber.

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