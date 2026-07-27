// Contenus partagés par toutes les pages : navigation, pied de page, CTA.
// Correspond au futur custom type single `settings` de Prismic. Le jour où il
// existe, seul ce fichier est remplacé par un appel client ; les composants ne
// bougent pas.

export const devisCta = {
	label: 'Demander un devis',
	href: '#devis',
};

export const nav = [
	{ label: 'Rénovation globale', href: '#renovation-globale' },
	{
		label: 'Nos expertises',
		children: [
			{ label: 'Extension & surélévation', href: '#exp-extension' },
			{ label: 'Piscine & aménagement extérieur', href: '#exp-piscine' },
			{ label: 'Cuisine & salle de bain', href: '#exp-cuisine' },
			{ label: 'Aménagement intérieur sur-mesure', href: '#exp-amenagement' },
		],
	},
	{ label: 'Réalisations', href: '#realisations' },
	{ label: 'Guides', href: '#guides' },
	{ label: 'Entreprise', href: '#entreprise' },
];

export const footer = {
	baseline:
		'Entreprise générale de rénovation en Gironde. Interlocuteur unique, gestion de A à Z, depuis 2018.',
	mentions: 'Garantie décennale · Assurances professionnelles',
	columns: [
		{
			title: 'Expertises',
			links: [
				{ label: 'Rénovation globale', href: '#renovation-globale' },
				{ label: 'Extension & surélévation', href: '#exp-extension' },
				{ label: 'Piscine & extérieur', href: '#exp-piscine' },
				{ label: 'Cuisine & salle de bain', href: '#exp-cuisine' },
				{ label: 'Aménagement sur-mesure', href: '#exp-amenagement' },
			],
		},
		{
			title: 'Entreprise',
			links: [
				{ label: 'Réalisations', href: '#realisations' },
				{ label: 'Guides', href: '#guides' },
				{ label: 'Notre méthode', href: '#entreprise' },
				{ label: 'Demander un devis', href: '#devis' },
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
