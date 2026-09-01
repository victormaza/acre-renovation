/**
 * Réécrit le contenu du document `expertise` « Rénovation globale » via la
 * Migration API de Prismic.
 *
 * Le script part du document publié, remplace le contenu des slices qu'il
 * connaît et laisse les autres intactes. Il est donc rejouable : le relancer
 * après une correction dans l'UI écrase à nouveau ces slices, rien d'autre.
 *
 * Requiert PRISMIC_WRITE_TOKEN dans .env — Prismic → Settings → API & Security
 * → Migration API (beta) → Generate token.
 *
 *   node scripts/maj-renovation-globale.mjs [--dry]
 *
 * La Migration API écrit un BROUILLON, rangé dans la Migration Release du dépôt :
 * la page reste inchangée en ligne tant qu'on n'a pas publié cette release.
 */

import * as prismic from '@prismicio/client';
import 'dotenv/config';

const REPOSITORY = '3u0gsum3';
const UID = 'renovation-globale';
const DRY = process.argv.includes('--dry');

const token = process.env.PRISMIC_WRITE_TOKEN;
if (!token && !DRY) {
	console.error('PRISMIC_WRITE_TOKEN manquant. Voir .env.example.');
	process.exit(1);
}

/* --- Helpers de champs -------------------------------------------------- */

const para = (...texts) =>
	texts.map((text) => ({ type: 'paragraph', text, spans: [], direction: 'ltr' }));
const heading = (level, text) => [
	{ type: `heading${level}`, text, spans: [], direction: 'ltr' },
];
const link = (url, text, variant) => ({
	link_type: 'Web',
	key: crypto.randomUUID(),
	url,
	text,
	...(variant ? { variant } : {}),
});
/** Group `{ title, text }` — `text` est un StructuredText dans tous ces groupes. */
const blocks = (pairs) => pairs.map(([title, text]) => ({ title, text: para(text) }));

/* --- Le contenu --------------------------------------------------------- */

const CONTENU = {
	expertise_hero: {
		eyebrow: 'Expertise · Activité principale',
		title: heading(1, 'Rénovation globale de maison & d’appartement'),
		text: para(
			'Un chantier complet, un seul interlocuteur, un budget maîtrisé du premier plan à la remise des clés. Nous réhabilitons entièrement maisons et appartements en Gironde — vous n’avez qu’un contact, nous coordonnons tout le reste.',
		),
		buttons: [
			link('/devis', 'Demander un devis', 'Filled'),
			link('/realisations', 'Voir des réalisations', 'Outline'),
		],
	},

	intro: {
		eyebrow: 'En quelques mots',
		text: para(
			'La rénovation globale s’adresse aux propriétaires qui achètent un bien à rénover, souhaitent agrandir leur surface habitable ou améliorer les performances énergétiques de leur logement — et qui préfèrent traiter l’ensemble dans un projet cohérent plutôt que d’empiler des travaux isolés au fil des années.',
			'Notre rôle est de piloter ce projet de bout en bout : étude, chiffrage détaillé poste par poste, coordination de tous les corps de métier et suivi de chantier. Un seul devis, un seul planning, un seul responsable face à vous.',
		),
	},

	// Les numéros « 01 — » sont posés par l'adaptateur de slice, pas saisis.
	prestation: {
		eyebrow: 'Ce que comprend la prestation',
		title: heading(2, 'Tous les lots, pilotés sous un même toit.'),
		items: blocks([
			[
				'Curage, démolition & maçonnerie',
				'Curage, démolition, ouverture de murs, reprises de structure et réagencement des volumes.',
			],
			[
				'Menuiseries extérieures',
				'Remplacement des fenêtres, portes et baies pour le confort et les économies d’énergie.',
			],
			[
				'Plomberie & électricité',
				'Mise aux normes complète des réseaux, tableau électrique, alimentation et évacuations.',
			],
			[
				'Chauffage & climatisation',
				'Pompe à chaleur, climatisation, ventilation : un système cohérent adapté au logement.',
			],
			[
				'Plâtrerie, menuiseries intérieures, sols & peinture',
				'Cloisons, distribution des pièces, carrelage, faïence, parquet, menuiseries intérieures et finitions soignées.',
			],
			['Cuisine', 'Cuisine intégrée au projet global et posée clés en main.'],
		]),
	},

	methode: {
		eyebrow: 'Notre méthode',
		title: heading(2, 'Du premier rendez-vous à la remise des clés.'),
		steps: blocks([
			[
				'Premier rendez-vous',
				'Découverte de votre projet et de vos besoins, visite du site.',
			],
			[
				'Étude du projet',
				'Nous menons les études techniques nécessaires (étude géotechnique, dimensionnement de structure…) et concevons le projet.',
			],
			[
				'Chiffrage détaillé',
				'Devis détaillé poste par poste, sans zone d’ombre, puis validation avec vous.',
			],
			[
				'Réalisation',
				'Nous coordonnons tous les corps de métier, gérons le planning, le budget et les démarches administratives, et vous tenons informé à chaque phase.',
			],
			[
				'Réception',
				'Réception du chantier, levée des réserves si besoin et activation des garanties.',
			],
		]),
	},

	points_attention: {
		eyebrow: 'Le conseil d’expert',
		title: heading(2, 'Points d’attention'),
		text: para(
			'Ce que notre expérience de terrain nous a appris à anticiper sur ce type de chantier.',
		),
		items: blocks([
			[
				'Une gestion de projet, pas seulement des travaux',
				'Une rénovation globale, c’est une multitude de détails techniques et de normes à maîtriser sur chaque lot. Gérer soi-même les corps de métier suppose des connaissances techniques pour bien coordonner et suivre l’ensemble — c’est précisément ce que nous prenons en charge à votre place.',
			],
			[
				'Découvertes en dépose',
				'Sur le bâti ancien girondin, la dépose peut réserver des surprises. Notre expérience nous permet de les anticiper dès l’étude et le chiffrage plutôt que de les découvrir en cours de route.',
			],
			[
				'Coordination & interlocuteur unique',
				'Études techniques, planning, budget, choix des matériaux avec vous, aspect administratif (par exemple une demande d’arrêté de voirie) : tout passe par un seul responsable. Vous ne courez pas après dix intervenants.',
			],
		]),
	},

	// `items` reste vide : la slice retombe alors sur les réalisations
	// rattachées à cette expertise. Rien à saisir ici.
	realisations: {
		eyebrow: 'Réalisations liées',
		title: heading(2, 'Des rénovations globales près de chez vous.'),
	},

	faq: {
		eyebrow: 'Questions fréquentes',
		title: heading(2, 'Vous vous demandez peut-être…'),
		items: [
			[
				'Combien de temps dure une rénovation globale ?',
				'Cela dépend fortement du bien et de l’ampleur du projet : comptez de 3 à 12 mois. Nous établissons un planning précis lors de l’étude.',
			],
			[
				'Comment est établi le budget ?',
				'Après une visite sur site et l’étude de votre projet, nous remettons un devis détaillé poste par poste. Chaque lot est chiffré, sans zone d’ombre, pour que vous sachiez exactement à quoi correspond le budget.',
			],
			[
				'Gérez-vous les démarches administratives ?',
				'Oui. Selon le projet, nous prenons en charge les études techniques et les démarches administratives nécessaires (par exemple une demande d’arrêté de voirie).',
			],
			[
				'Pourquoi passer par un interlocuteur unique plutôt que gérer les artisans moi-même ?',
				'Parce que nous coordonnons l’ensemble des corps de métier, le planning et le budget à votre place, avec les connaissances techniques que cela demande. Vous avez un seul contact, du devis à la livraison.',
			],
		].map(([question, answer]) => ({ question, answer: para(answer) })),
	},
};

/* --- Exécution ---------------------------------------------------------- */

const client = prismic.createClient(REPOSITORY, { fetch });
const document = await client.getByUID('expertise', UID, { lang: 'fr-fr' });

const touched = [];
for (const slice of document.data.slices) {
	const patch = CONTENU[slice.slice_type];
	if (!patch) continue;
	Object.assign(slice.primary, patch);
	touched.push(slice.slice_type);
}

const ignored = Object.keys(CONTENU).filter((type) => !touched.includes(type));
if (ignored.length) {
	console.error(`Slices absentes du document, non écrites : ${ignored.join(', ')}`);
	process.exit(1);
}

console.log(`Slices réécrites : ${touched.join(', ')}`);

if (DRY) {
	console.log(JSON.stringify(document.data.slices, null, 2));
	process.exit(0);
}

const writeClient = prismic.createWriteClient(REPOSITORY, { writeToken: token, fetch });
const migration = prismic.createMigration();
migration.updateDocument(document, document.data.title?.[0]?.text ?? UID);
await writeClient.migrate(migration, {
	reporter: (event) => console.log(`  ${event.type}`),
});

console.log('\nBrouillon écrit. À relire puis publier depuis la Migration Release de Prismic.');
