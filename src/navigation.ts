/**
 * Navigation et pied de page, assemblés au build.
 *
 * Les entrées « expertises » viennent des documents publiés plutôt que d'une
 * liste tenue à la main : une expertise publiée apparaît d'elle-même dans le
 * menu, et surtout aucune entrée ne pointe vers une page qui n'existe pas.
 * C'est le défaut qu'avait la liste en dur — elle citait cinq expertises alors
 * qu'une seule était écrite, et ses quatre autres ancres ne menaient nulle
 * part, ni sur l'accueil ni ailleurs.
 */

import type { KeyTextField, PrismicDocument } from '@prismicio/client';
import { createClient, hasType } from './prismicio';
import { devisCta, expertisesMenuLabel, footer, navRest } from './data/settings';
import type { NavItem, NavLink } from './types';

type ExpertiseNavDocument = PrismicDocument<
	{ title: KeyTextField; nav_label: KeyTextField },
	'expertise'
>;

/**
 * Les expertises publiées, dans l'ordre d'ancienneté — le même repli que la
 * grille de l'accueil, pour que menu et page racontent la même histoire.
 *
 * ⚠️ Si le client ordonne les expertises à la main dans la slice de l'accueil,
 * le menu ne suit pas : il n'a pas accès à cette sélection. À reprendre le jour
 * où l'ordre du menu doit être piloté, probablement via le single `settings`.
 */
async function getExpertises(): Promise<NavLink[]> {
	if (!(await hasType('expertise'))) return [];

	const client = await createClient();
	const documents = await client.getAllByType<ExpertiseNavDocument>('expertise', {
		orderings: [{ field: 'document.first_publication_date', direction: 'asc' }],
	});

	return documents
		.filter((document) => document.url)
		.map((document) => ({
			// Le titre complet est trop long pour une barre de navigation
			// (« Rénovation globale de maison & d'appartement »), d'où le libellé
			// court. Il reste facultatif : sans lui, on retombe sur le titre.
			label: document.data.nav_label || document.data.title || '',
			href: document.url!,
		}));
}

/**
 * La première expertise occupe une entrée de premier niveau, les suivantes le
 * menu déroulant — même hiérarchie que la grille de l'accueil, où la première
 * prend la grande carte. Avec une seule expertise publiée, il n'y a donc pas
 * de déroulant du tout.
 */
export async function getNav(): Promise<NavItem[]> {
	const [featured, ...rest] = await getExpertises();

	return [
		...(featured ? [featured] : []),
		...(rest.length > 0 ? [{ label: expertisesMenuLabel, children: rest }] : []),
		...navRest,
	];
}

export async function getFooter() {
	const expertises = await getExpertises();
	const { expertisesColumnTitle, columns, ...rest } = footer;

	return {
		...rest,
		// La colonne « Expertises » disparaît tant qu'aucune n'est publiée,
		// plutôt que de laisser un titre suivi du vide.
		columns: [
			...(expertises.length > 0
				? [{ title: expertisesColumnTitle, links: expertises }]
				: []),
			...columns,
		],
	};
}

export { devisCta };
