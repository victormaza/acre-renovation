import * as prismic from '@prismicio/client';

// Nom du dépôt Prismic — visible dans toutes les URLs de l'API, rien de secret.
// C'est bien `3u0gsum3` et non `acre-renovation` : c'est le sous-domaine qui
// répond sur l'API de contenu, et la valeur attendue dans l'en-tête
// `repository` de la Custom Types API.
export const repositoryName = '3u0gsum3';

// Mapping type + UID → chemin d'URL. C'est ce qui alimente `document.url`,
// donc les liens internes n'ont jamais à être construits à la main.
//
// Prismic valide cette table contre les types existants et refuse la requête
// si l'un d'eux est inconnu : n'ajouter une ligne qu'une fois le custom type
// créé. Les chemins restent à confirmer avec le plan de redirections 301.
export const routes: prismic.ClientConfig['routes'] = [
	{ type: 'homepage', path: '/' },
	// À réactiver au fur et à mesure de la création des types :
	// { type: 'realisation', path: '/realisations/:uid' },
	// { type: 'guide', path: '/guides/:uid' },
	// { type: 'expertise', path: '/expertises/:uid' },
	// { type: 'page_ville', path: '/renovation/:uid' },
];

export const createClient = (config: prismic.ClientConfig = {}) =>
	prismic.createClient(repositoryName, { routes, ...config });
