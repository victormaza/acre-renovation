// Contenus du configurateur de demande de devis.
// Même parti pris que `settings.ts` : les libellés sont ici, le composant les
// reçoit en props. Le jour où le client veut les piloter, seul ce fichier est
// remplacé par un single Prismic `devis` ; le markup ne bouge pas.
//
// Ces listes servent aussi de référentiel de validation côté serveur
// (`src/pages/api/devis.ts`) : une valeur absente de la liste est rejetée.

export interface Choice {
	label: string;
	hint?: string;
}

/** Étape 1 — le clic sélectionne et fait avancer d'un coup. */
export const projectTypes: Choice[] = [
	{ label: 'Rénovation globale', hint: 'Maison ou appartement' },
	{ label: 'Extension ou surélévation', hint: 'Gagner de la surface' },
	{ label: 'Piscine ou aménagement extérieur', hint: 'Terrasse, piscine, abords' },
	{ label: 'Rénovation cuisine ou salle de bain', hint: "Pièces d'eau clés en main" },
	{ label: 'Aménagement intérieur sur-mesure', hint: 'Rangements, menuiseries' },
];

/** Étape 2 */
export const propertyTypes: Choice[] = [{ label: 'Maison' }, { label: 'Appartement' }];

export const surfaces: Choice[] = [
	{ label: 'Moins de 50 m²' },
	{ label: '50 – 100 m²' },
	{ label: '100 – 150 m²' },
	{ label: '150 – 200 m²' },
	{ label: 'Plus de 200 m²' },
];

/** Étape 4 */
export const budgets: Choice[] = [
	{ label: 'Moins de 30 k€' },
	{ label: '30 – 60 k€' },
	{ label: '60 – 100 k€' },
	{ label: '100 – 200 k€' },
	{ label: 'Plus de 200 k€' },
];

export const timings: Choice[] = [
	{ label: 'Dès que possible', hint: 'Projet prioritaire' },
	{ label: 'Dans 3 à 6 mois', hint: 'À planifier' },
	{ label: 'Je me renseigne', hint: 'Pas de date fixée' },
];

/** Étape 3 — puces qui pré-remplissent le champ ville. */
export const citySuggestions = [
	'Bordeaux',
	'Mérignac',
	'Pessac',
	'Andernos',
	'Cap Ferret',
	'Arcachon',
];

/**
 * Zone d'intervention habituelle. Sert uniquement à décider si l'on affiche le
 * message « un peu loin de chez nous » — qui reste **non bloquant** : une
 * commune hors liste n'empêche jamais l'envoi.
 *
 * Comparaison en minuscules sans accent (voir `normalizeCity`), donc inutile
 * de doubler les entrées accentuées ici.
 */
export const inZoneCities = [
	'bordeaux',
	'merignac',
	'pessac',
	'talence',
	'begles',
	'bruges',
	'le bouscat',
	'andernos',
	'cap ferret',
	'lege',
	'arcachon',
	'ares',
	'gujan',
	'biganos',
	'la teste',
	'libourne',
	'saint-medard',
	'gradignan',
	'villenave',
	'cenon',
	'floirac',
	'bassens',
	'ambares',
	'eysines',
	'le haillan',
	'lormont',
	'blanquefort',
];

/** Gironde, Landes, Lot-et-Garonne. */
export const inZonePostalPrefixes = ['33', '40', '47'];

export const reassurance = ['Sans engagement', 'Réponse sous 48 h', 'Garantie décennale'];

export const confirmation = {
	delai: '48 h ouvrées',
	links: [
		{ label: 'Voir nos réalisations', href: '/realisations', primary: true },
		{ label: 'Lire nos guides', href: '/guides', primary: false },
	],
};

/**
 * Normalise une saisie de ville pour la comparaison : minuscules, accents
 * retirés, espaces resserrés. Partagée par le navigateur et le serveur, pour
 * que le message hors-zone et le récapitulatif de l'email disent la même chose.
 */
export function normalizeCity(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');
}
