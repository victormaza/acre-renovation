// Contenus partagés par toutes les pages : navigation, pied de page, CTA.
// Correspond au futur custom type single `settings` de Prismic. Le jour où il
// existe, seul ce fichier est remplacé par un appel client ; les composants ne
// bougent pas.
//
// Les entrées « expertises » n'y figurent plus : elles sont dérivées des
// documents publiés au build, par `src/navigation.ts`. C'est ce qui évite
// qu'une expertise renommée, réordonnée ou pas encore écrite laisse un lien
// mort dans le menu.
//
// Les ancres restantes visent des sections de l'accueil, d'où le `/` en tête :
// depuis une page expertise, un `#ancre` nu ne mènerait nulle part.

import type { NavItem, NavLink } from '../types';

/**
 * Une entrée de menu qui peut viser un document `page`.
 *
 * `page` porte l'UID du document ; s'il est publié, son URL remplace `href`.
 * Sinon l'entrée garde `href`, qui reste donc le repli — jamais un lien mort.
 */
export interface NavEntry extends NavItem {
	page?: string;
}

export const devisCta: NavLink = {
	label: 'Demander un devis',
	href: '/devis',
};

/** Entrées de menu qui ne dépendent pas des expertises publiées. */
export const navRest: NavEntry[] = [
	{ label: 'Réalisations', href: '/realisations' },
	{ label: 'Guides', href: '/#guides' },
	// La page entreprise est un document `page` : le menu la vise par son UID,
	// pas par son chemin. Tant qu'elle n'est pas publiée, l'ancre de l'accueil
	// tient lieu de repli.
	{ label: 'Entreprise', href: '/#entreprise', page: 'entreprise' },
];

export const expertisesMenuLabel = 'Nos expertises';

export const footer = {
	baseline:
		'Entreprise générale de rénovation en Gironde. Interlocuteur unique, gestion de A à Z, depuis 2018.',
	mentions: 'Garantie décennale · Assurances professionnelles',
	expertisesColumnTitle: 'Expertises',
	columns: [
		{
			title: 'Entreprise',
			links: [
				{ label: 'Réalisations', href: '/realisations' },
				{ label: 'Guides', href: '/#guides' },
				{ label: 'Notre méthode', href: '/#entreprise' },
				{ label: 'Demander un devis', href: '/devis' },
			],
		},
	],
	zones: {
		title: "Nos zones d'intervention",
		links: [
			'Bordeaux',
			'Mérignac',
			'Pessac',
			'Talence',
			'Bègles',
			'Le Bouscat',
			'Andernos-les-Bains',
			'Cap Ferret',
			'Arcachon',
			'Gujan-Mestras',
			'Arès',
			'Libourne',
		].map((label) => ({ label, href: '#' })),
	},
	copyright: '© 2026 Acre Rénovation — Tous droits réservés',
	legal: [
		{ label: 'Mentions légales', href: '#' },
		{ label: 'Politique de confidentialité', href: '#' },
	],
};
