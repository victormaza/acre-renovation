import * as prismic from '@prismicio/client';

// Nom du dépôt Prismic — visible dans toutes les URLs de l'API, rien de secret.
// C'est bien `3u0gsum3` et non `acre-renovation` : c'est le sous-domaine qui
// répond sur l'API de contenu, et la valeur attendue dans l'en-tête
// `repository` de la Custom Types API.
export const repositoryName = '3u0gsum3';

// Mapping type + UID → chemin d'URL. C'est ce qui alimente `document.url`,
// donc les liens internes n'ont jamais à être construits à la main.
// Les chemins restent à confirmer avec le plan de redirections 301.
export const routes: NonNullable<prismic.ClientConfig['routes']> = [
	{ type: 'homepage', path: '/' },
	{ type: 'page_realisations', path: '/realisations' },
	{ type: 'realisation', path: '/realisations/:uid' },
	{ type: 'guide', path: '/guides/:uid' },
	{ type: 'expertise', path: '/expertises/:uid' },
	// À ajouter le jour où le type existe :
	// { type: 'page_ville', path: '/renovation/:uid' },
];

// L'API de contenu n'annonce un type qu'à partir de son premier document, et
// rejette *toute* la table de routes si l'un des types cités lui est inconnu.
// Déclarer `realisation` avant que la première réalisation soit publiée ferait
// donc échouer jusqu'à la requête de la home. On n'envoie que les routes des
// types réellement présents : chacune s'active d'elle-même quand le contenu
// arrive, et le build ne dépend plus de l'ordre de saisie.
let advertisedTypes: Promise<Set<string>> | undefined;

const getAdvertisedTypes = () => {
	advertisedTypes ??= prismic
		.createClient(repositoryName)
		.getRepository()
		.then((repository) => new Set(Object.keys(repository.types)));
	return advertisedTypes;
};

/**
 * Le type est-il connu de l'API de contenu ? Faux tant qu'aucun document du
 * type n'a été publié — l'interroger renverrait alors une erreur. À vérifier
 * avant tout `getAllByType`, y compris dans un `getStaticPaths()`.
 */
export const hasType = async (type: string) => (await getAdvertisedTypes()).has(type);

export const createClient = async (config: prismic.ClientConfig = {}) => {
	const types = await getAdvertisedTypes();
	return prismic.createClient(repositoryName, {
		routes: routes.filter((route) => types.has(route.type)),
		...config,
	});
};

/**
 * Résout les documents référencés par une slice de listing.
 *
 * Les slices `expertises`, `realisations` et `guides` ne stockent plus le
 * contenu des cartes : elles pointent vers les documents. Le client crée une
 * fiche une seule fois, et la home suit — pas de recopie, pas de désynchro.
 *
 * `picks` vide n'est pas une erreur mais le mode par défaut : on retombe sur
 * les derniers documents publiés du type. Publier une réalisation suffit donc
 * à la faire apparaître, la sélection manuelle ne servant qu'à forcer un
 * ordre ou une vitrine précise.
 *
 * `match` restreint ce repli sans toucher à la sélection manuelle : un choix
 * explicite du client est toujours honoré, même s'il sort du filtre.
 */
export async function resolvePicks<TDocument extends prismic.PrismicDocument>(
	type: string,
	picks: prismic.LinkField[],
	fallback: {
		limit?: number;
		direction?: 'asc' | 'desc';
		match?: (document: TDocument) => boolean;
	} = {},
): Promise<TDocument[]> {
	// Type sans aucun document : la section n'a rien à afficher, et l'API
	// n'accepterait pas encore d'être interrogée dessus.
	if (!(await hasType(type))) return [];

	const client = await createClient();
	const ids = picks.filter(prismic.isFilled.contentRelationship).map((pick) => pick.id);

	if (ids.length > 0) {
		// `getByIDs` ne garantit pas l'ordre du tableau demandé : on le rétablit.
		// Un document dépublié disparaît de la réponse, et donc de la grille,
		// plutôt que de laisser une carte vide ou un lien mort.
		const { results } = await client.getByIDs<TDocument>(ids, { pageSize: ids.length });
		const byID = new Map(results.map((document) => [document.id, document]));
		return ids.map((id) => byID.get(id)).filter((document) => document !== undefined);
	}

	const { limit, direction = 'desc', match } = fallback;

	// Le tri est délégué à l'API, mais pas le filtrage. `filter.at()` sur un
	// champ que *aucun* document publié ne renseigne encore échoue : l'index de
	// requête n'apprend un champ qu'à la première publication qui le porte, et
	// `at(my.realisation.expertise, …)` répondait « unexpected field » tant
	// qu'aucune réalisation n'était rattachée. Même piège que la table de
	// routes plus haut, un cran plus bas. On trie donc en mémoire : à l'échelle
	// du site, c'est quelques dizaines de documents.
	const documents = await client.getAllByType<TDocument>(type, {
		limit: match ? undefined : limit,
		orderings: [{ field: 'document.first_publication_date', direction }],
	});

	if (!match) return documents;

	// Le `limit` s'applique après coup, sinon il rognerait avant le filtrage et
	// renverrait moins de documents que demandé — voire aucun.
	const kept = documents.filter(match);
	return limit === undefined ? kept : kept.slice(0, limit);
}
