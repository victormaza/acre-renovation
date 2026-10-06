/**
 * Écrit le document `expertise` « Extension & surélévation » via la Migration
 * API de Prismic.
 *
 * Contrairement à `maj-renovation-globale.mjs`, le document n'existe pas
 * encore : le script le crée s'il n'est pas publié, et le met à jour sinon.
 * Une fois publié, le relancer réécrit tout le contenu ci-dessous — photos
 * comprises si on les a laissées vides ici, d'où la reprise des images déjà
 * saisies (voir `keepImages`).
 *
 * Les slices `reassurance` et `cta_final` gardent la structure de la page
 * « Rénovation globale » : la réassurance est reprise telle quelle, le CTA
 * final avec son texte propre.
 *
 *   node scripts/maj-extension-surelevation.mjs [--dry]
 *
 * ⚠️ Création = POST puis PUT (voir AGENTS.md, « pièges de la Migration
 * API »). L'id rendu par le POST est loggé : le noter. Un timeout sur le POST
 * peut avoir créé le document quand même — vérifier dans la Migration Release
 * avant de relancer, sous peine d'UID fantôme.
 */

import * as prismic from '@prismicio/client';
import 'dotenv/config';

const REPOSITORY = '3u0gsum3';
const UID = 'extension-surelevation';
const MODELE = 'renovation-globale';
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
const slice = (slice_type, primary, variation = 'default') => ({
	id: `${slice_type}$${crypto.randomUUID()}`,
	slice_type,
	slice_label: null,
	variation,
	version: 'initial',
	primary,
	items: [],
});

/* --- Le contenu --------------------------------------------------------- */

// Requêtes visées — volumes mensuels du Planificateur Google Ads, Gironde,
// relevés le 6 octobre 2026 : « extension maison » 1 900, « agrandissement
// maison » 170, « surélévation maison » 140, puis 20 à 30 chacune pour
// « extension maison bordeaux », « extension ossature bois », « rehausse
// maison ». Les variantes « + ville » plafonnent à ~10 : la page vise donc les
// requêtes génériques, que Google localise de lui-même, et cite les villes
// sans leur consacrer de page. Les questions (prix au m², permis, ossature
// bois, échoppe) sont reprises en FAQ.

const DOCUMENT = {
	title: 'Extension & surélévation de maison',
	nav_label: 'Extension & surélévation',
	badge: null,
	short_text:
		'Agrandir de plain-pied ou gagner un étage : étude de faisabilité, autorisations d’urbanisme et travaux tous corps d’état, avec un seul interlocuteur.',
	cta_label: 'Découvrir l’extension & la surélévation',
	meta_title: 'Extension et surélévation de maison à Bordeaux | Acre Rénovation',
	meta_description:
		'Agrandir votre maison en Gironde : extension, surélévation, échoppe bordelaise. Faisabilité, permis de construire et travaux pilotés par un seul interlocuteur.',
};

const SLICES = [
	slice('expertise_hero', {
		eyebrow: 'Expertise · Agrandissement',
		title: heading(1, 'Extension & surélévation de maison à Bordeaux et en Gironde'),
		text: para(
			'Besoin d’une chambre, d’une suite parentale ou d’une pièce de vie plus grande, sans quitter un quartier que vous aimez ? Nous agrandissons votre maison de plain-pied ou par un étage, de l’étude de faisabilité à la remise des clés.',
		),
		buttons: [
			link('/devis', 'Demander un devis', 'Filled'),
			link('/realisations', 'Voir des réalisations', 'Outline'),
		],
		image: {},
		scale: 'Standard',
	}),

	slice('intro', {
		eyebrow: 'Extension ou surélévation ?',
		text: para(
			'Agrandir sa maison coûte souvent moins cher que de déménager, et cela valorise le bien. Deux voies existent. L’extension gagne de la surface au sol, en prolongement de la maison : idéale pour ouvrir une pièce de vie sur le jardin. La surélévation, ou rehausse, crée un étage sans toucher au terrain : c’est la solution des parcelles serrées, et celle de nombreuses échoppes bordelaises.',
			'Le bon choix dépend du terrain, de la structure existante et des règles d’urbanisme de votre commune. Nous les vérifions avant tout chiffrage, puis nous pilotons le projet de bout en bout : démarches, gros œuvre, raccordement à l’existant et finitions. Un seul devis, un seul planning, un seul responsable face à vous.',
			'Nous réalisons extensions et surélévations à Bordeaux et dans sa métropole, notamment à Pessac, Mérignac et Talence, ainsi que sur le Bassin d’Arcachon : Andernos-les-Bains, Lanton, Arès et Lège-Cap-Ferret.',
		),
	}),

	slice('prestation', {
		eyebrow: 'Ce que comprend la prestation',
		title: heading(2, 'De l’étude de faisabilité aux finitions, un seul interlocuteur'),
		items: blocks([
			[
				'Étude de faisabilité',
				'Lecture du PLU de votre commune, vérification de la structure et des fondations existantes, étude de sol si nécessaire : nous savons ce qui est possible avant de chiffrer.',
			],
			[
				'Déclaration préalable ou permis de construire',
				'Montage et dépôt du dossier d’urbanisme adapté à la surface créée, avec nos architectes partenaires lorsque le projet l’exige, et suivi jusqu’à l’autorisation.',
			],
			[
				'Fondations & structure, maçonnerie ou ossature bois',
				'Fondations de l’extension, murs en maçonnerie traditionnelle ou en ossature bois, plancher, renforcement de la structure existante pour accueillir un étage.',
			],
			[
				'Charpente, couverture & étanchéité',
				'Nouvelle toiture, reprise de l’existante, toit plat ou en pente : une enveloppe étanche et durable.',
			],
			[
				'Isolation & menuiseries extérieures',
				'Une surface neuve isolée aux normes actuelles, baies vitrées et fenêtres pour faire entrer la lumière.',
			],
			[
				'Raccordement & aménagement intérieur',
				'Ouverture sur l’existant, escalier, électricité, plomberie, chauffage, sols et peinture : la nouvelle pièce est livrée prête à vivre.',
			],
		]),
	}),

	slice(
		'methode',
		{
			eyebrow: 'Notre méthode',
			title: heading(2, 'Du premier rendez-vous à la remise des clés.'),
			steps: blocks([
				[
					'Visite & faisabilité',
					'Découverte de votre projet, visite de la maison et vérification des règles d’urbanisme applicables.',
				],
				[
					'Conception & chiffrage',
					'Études techniques (sol, structure), plans du projet et devis détaillé poste par poste.',
				],
				[
					'Autorisations',
					'Dépôt de la déclaration préalable ou du permis de construire, et suivi de l’instruction.',
				],
				[
					'Travaux',
					'Nous coordonnons tous les corps de métier, tenons le planning et le budget, et vous informons à chaque phase.',
				],
				[
					'Réception',
					'Réception du chantier, levée des réserves si besoin et activation des garanties.',
				],
			]),
		},
		'dark',
	),

	slice('points_attention', {
		eyebrow: 'Le conseil d’expert',
		title: heading(2, 'Points d’attention'),
		text: para(
			'Ce que notre expérience de terrain nous a appris à anticiper sur un agrandissement.',
		),
		items: blocks([
			[
				'Les règles d’urbanisme d’abord',
				'Emprise au sol, hauteur, distance aux limites, aspect extérieur : le PLU décide de ce qui est faisable. À Bordeaux, certaines rues et échoppes sont protégées, et l’avis de l’Architecte des Bâtiments de France allonge l’instruction. Mieux vaut le savoir avant de rêver d’un étage.',
			],
			[
				'La structure existante',
				'Une surélévation fait porter un étage à des murs et des fondations qui n’ont pas été conçus pour lui, a fortiori sur le bâti ancien girondin. Un diagnostic de structure est indispensable, et oriente souvent vers une ossature bois, plus légère, que nous proposons aussi pour les extensions.',
			],
			[
				'Le sol girondin',
				'Une grande partie de la Gironde est exposée au retrait-gonflement des argiles. Une étude de sol permet de dimensionner les fondations de l’extension et d’éviter les fissures entre l’ancien et le neuf.',
			],
			[
				'La jonction avec l’existant',
				'Étanchéité, continuité de l’isolation, niveaux de plancher : c’est au raccord que se jouent la qualité et la durabilité d’un agrandissement. Nous le traitons comme un lot à part entière.',
			],
		]),
	}),

	// `items` reste vide : la slice retombe alors sur les réalisations
	// rattachées à cette expertise. Rien à saisir ici.
	slice('realisations', {
		eyebrow: 'Réalisations liées',
		title: heading(2, 'Des agrandissements près de chez vous.'),
		link: link('/realisations', 'Toutes les réalisations'),
		count: null,
		items: [],
	}),

	slice('faq', {
		eyebrow: 'Questions fréquentes',
		title: heading(2, 'Vous vous demandez peut-être…'),
		items: [
			[
				'Faut-il un permis de construire pour une extension ou une surélévation ?',
				'Cela dépend de la surface créée. Dans une zone urbaine couverte par un PLU, une déclaration préalable suffit jusqu’à 40 m², sauf si la maison dépasse alors 150 m² au total. Au-delà, ou hors zone urbaine dès 20 m², un permis de construire est nécessaire. Nous vérifions votre cas lors de l’étude et montons le dossier.',
			],
			[
				'Faut-il passer par un architecte ?',
				'Oui, si la surface de plancher totale de la maison dépasse 150 m² après travaux : le recours à un architecte est alors obligatoire pour le permis de construire. En dessous, il est facultatif. Dans les deux cas, vous n’avez pas à en chercher un : nous travaillons avec des architectes partenaires.',
			],
			[
				'Quel est le prix d’une extension ou d’une surélévation au m² ?',
				'À Bordeaux et en Gironde, comptez en général de 1 800 à 3 500 € le m². Le prix dépend du mode constructif (maçonnerie ou ossature bois), de l’état de la structure existante, des fondations et du niveau de finition. Après visite et étude, nous remettons un devis détaillé poste par poste.',
			],
			[
				'Extension en ossature bois ou en maçonnerie : que choisir ?',
				'Les deux sont possibles, en extension comme en surélévation. L’ossature bois est légère, ce qui ménage la structure existante et les fondations, et son chantier est plus rapide et plus propre. La maçonnerie traditionnelle apporte de l’inertie thermique et s’accorde naturellement à une maison en pierre ou en parpaing. Le PLU, l’aspect recherché et la nature du sol orientent le choix : nous vous conseillons lors de l’étude.',
			],
			[
				'Peut-on surélever une échoppe bordelaise ?',
				'Souvent oui, mais pas partout : le PLU de Bordeaux Métropole encadre la surélévation des échoppes, et certaines rues sont protégées. Nous vérifions les règles applicables à votre adresse avant d’engager une étude.',
			],
			[
				'Intervenez-vous sur le Bassin d’Arcachon ?',
				'Oui, à Andernos-les-Bains, Lanton, Arès et Lège-Cap-Ferret notamment. Les communes du Bassin relèvent de la loi Littoral et ont souvent des règles d’urbanisme plus strictes que la métropole : nous les vérifions dès la visite. L’ossature bois y est fréquemment retenue pour les extensions comme pour les surélévations.',
			],
			[
				'Combien de temps durent les travaux ?',
				'Comptez quelques mois de chantier selon l’ampleur du projet, auxquels s’ajoute l’instruction de l’autorisation d’urbanisme : un mois pour une déclaration préalable, deux mois pour un permis de construire, davantage en secteur protégé. Nous établissons un planning précis lors de l’étude.',
			],
			[
				'Peut-on rester dans la maison pendant les travaux ?',
				'Pour une extension, c’est généralement possible : l’essentiel du chantier se déroule à l’extérieur jusqu’à l’ouverture sur l’existant. Pour une surélévation, cela dépend de l’intervention sur la toiture ; nous en parlons dès l’étude pour organiser le chantier en conséquence.',
			],
		].map(([question, answer]) => ({ question, answer: para(answer) })),
	}),

	// `reassurance` est reprise de la page modèle, telle quelle.
	'reassurance',

	slice('cta_final', {
		title: heading(2, 'Un projet d’agrandissement ?'),
		text: para(
			'Décrivez votre projet en quelques minutes. Nous revenons vers vous pour organiser une visite, vérifier la faisabilité et vous remettre un chiffrage détaillé.',
		),
		button: link('/devis', 'Demander un devis gratuit'),
		note: 'Réponse sous 48 h ouvrées · sans engagement',
	}),
];

/* --- Exécution ---------------------------------------------------------- */

const client = prismic.createClient(REPOSITORY, { fetch });
const modele = await client.getByUID('expertise', MODELE, { lang: 'fr-fr' });
const existant = await client
	.getByUID('expertise', UID, { lang: 'fr-fr' })
	.catch((error) => (error instanceof prismic.NotFoundError ? null : Promise.reject(error)));

const slices = SLICES.map((entry) => {
	if (typeof entry !== 'string') return entry;
	const copie = modele.data.slices.find((s) => s.slice_type === entry);
	if (!copie) throw new Error(`Slice « ${entry} » absente de la page modèle.`);
	return { ...structuredClone(copie), id: `${entry}$${crypto.randomUUID()}` };
});

// Une photo saisie à la main dans Prismic survit à une relance du script.
const keepImages = (doc) => {
	if (!existant) return doc;
	for (const field of ['image', 'meta_image']) doc[field] = existant.data[field];
	const hero = existant.data.slices.find((s) => s.slice_type === 'expertise_hero');
	const heroNeuf = slices.find((s) => s.slice_type === 'expertise_hero');
	if (hero?.primary.image?.url) heroNeuf.primary.image = hero.primary.image;
	return doc;
};

const data = keepImages({ ...DOCUMENT, image: {}, meta_image: {}, slices });

console.log(existant ? `Mise à jour de ${existant.id}` : `Création de « ${UID} »`);
console.log(`Slices : ${slices.map((s) => s.slice_type).join(', ')}`);

if (DRY) {
	console.log(JSON.stringify(data, null, 2));
	process.exit(0);
}

const writeClient = prismic.createWriteClient(REPOSITORY, { writeToken: token, fetch });
const migration = prismic.createMigration();

if (existant) {
	migration.updateDocument({ ...existant, data }, DOCUMENT.title);
} else {
	migration.createDocument(
		{ type: 'expertise', uid: UID, lang: 'fr-fr', tags: [], data },
		DOCUMENT.title,
	);
}

await writeClient.migrate(migration, {
	// Le détail des événements porte l'id du document créé : à garder.
	reporter: (event) => {
		let detail = '';
		try {
			detail = JSON.stringify(event.data ?? '');
		} catch {
			detail = String(event.data);
		}
		console.log(`  ${event.type}`, detail);
	},
});

console.log('\nBrouillon écrit. À relire puis publier depuis la Migration Release de Prismic.');
