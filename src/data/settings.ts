// Contenus partagés par toutes les pages : navigation, pied de page, CTA.
// Correspond au futur custom type single `settings` de Prismic. Le jour où il
// existe, seul ce fichier est remplacé par un appel client ; les composants ne
// bougent pas.

export const devisCta = {
	label: 'Demander un devis',
	href: '/devis',
};

export const nav = [
	{ label: 'Rénovation globale', href: '/#renovation-globale' },
	// Ces ancres sont produites par slugify() sur le titre de chaque expertise
	// (voir src/slices/expertises/index.astro). Renommer une expertise dans
	// Prismic change donc son ancre : à répercuter ici tant que la navigation
	// n'est pas elle-même pilotée par le CMS.
	//
	// Elles visent des sections de l'accueil, d'où le `/` en tête : depuis une
	// page expertise, un `#ancre` nu ne mènerait nulle part.
	{
		label: 'Nos expertises',
		children: [
			{ label: 'Extension & surélévation', href: '/#extension-surelevation' },
			{ label: 'Piscine & aménagement extérieur', href: '/#piscine-amenagement-exterieur' },
			{ label: 'Cuisine & salle de bain', href: '/#cuisine-salle-de-bain' },
			{ label: 'Aménagement intérieur sur-mesure', href: '/#amenagement-interieur-sur-mesure' },
		],
	},
	{ label: 'Réalisations', href: '/#realisations' },
	{ label: 'Guides', href: '/#guides' },
	{ label: 'Entreprise', href: '/#entreprise' },
];

export const footer = {
	baseline:
		'Entreprise générale de rénovation en Gironde. Interlocuteur unique, gestion de A à Z, depuis 2018.',
	mentions: 'Garantie décennale · Assurances professionnelles',
	columns: [
		{
			title: 'Expertises',
			links: [
				{ label: 'Rénovation globale', href: '/#renovation-globale' },
				{ label: 'Extension & surélévation', href: '/#extension-surelevation' },
				{ label: 'Piscine & extérieur', href: '/#piscine-amenagement-exterieur' },
				{ label: 'Cuisine & salle de bain', href: '/#cuisine-salle-de-bain' },
				{ label: 'Aménagement sur-mesure', href: '/#amenagement-interieur-sur-mesure' },
			],
		},
		{
			title: 'Entreprise',
			links: [
				{ label: 'Réalisations', href: '/#realisations' },
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
