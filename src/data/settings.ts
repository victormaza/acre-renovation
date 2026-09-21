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

/**
 * Second appel à l'action, à côté du devis. Le numéro est affiché en clair :
 * sur ordinateur, le lien `tel:` ne mène souvent à rien, le visiteur doit
 * pouvoir le lire. `href` porte l'indicatif international, que tout téléphone
 * compose, y compris depuis l'étranger. Espaces insécables : le numéro ne se
 * coupe jamais en deux lignes.
 */
export const phoneCta: NavLink = {
	label: '06\u00a003\u00a010\u00a008\u00a094',
	href: 'tel:+33603100894',
};

/**
 * Ligne de réassurance sous le bouton devis des bandeaux d'ouverture (accueil
 * et pages expertise). Texte simple, sans balisage `AggregateRating` : Google
 * sanctionne les avis auto-déclarés sur sa propre entité.
 *
 * ⚠️ Le nombre d'avis est recopié à la main : à mettre à jour avec la fiche
 * Google, comme les avis de la slice `avis`.
 */
export const heroProof = {
	stars: 5,
	items: ['5/5 sur 8\u00a0avis Google', 'Garantie décennale', 'Depuis 2018'],
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
