/**
 * Import unique : la page « À propos » de l'ancien site, recréée dans Prismic
 * sur le type `page`. Script jetable — le contenu vit chez Prismic ensuite.
 *
 *   node scripts/.import-entreprise.mjs              → crée le document
 *   DOC_ID=<id> node scripts/.import-entreprise.mjs  → remplit un document existant
 *
 * ⚠️ L'API de migration crée le document *vide*, puis le met à jour avec les
 * données. Un champ refusé à la seconde étape laisse donc un brouillon vide
 * derrière lui, et l'API n'expose ni GET ni DELETE pour le retrouver : d'où le
 * mode DOC_ID, et l'affichage de l'identifiant à la création.
 */
import * as prismic from '@prismicio/client';
import 'dotenv/config';

const engagements = [
	['Respect des délais et qualité garantie', "Nous nous engageons à respecter les délais fixés tout en maintenant un niveau de qualité élevé dans tous nos travaux."],
	['Un seul interlocuteur dédié', "Vous bénéficiez d’un seul point de contact tout au long de votre projet, pour une communication claire et continue."],
	['Écoute et adaptation', "Nous sommes attentifs à vos besoins et nous adaptons nos services en fonction de vos contraintes et de vos souhaits."],
	['Devis clair et détaillé', "Votre chargé d’affaires vous fournit un devis précis et transparent, remis dans un délai maximum de trois semaines après la visite de votre bien."],
	['Propreté du chantier', "Nos équipes veillent à maintenir votre chantier propre et ordonné tout au long des travaux."],
	['Respect des normes', "Nous garantissons le respect des normes en vigueur (DTU) et veillons à la santé et à la sécurité de nos équipes sur le chantier."],
	['Flexibilité du projet', "Nous comprenons que les projets peuvent évoluer. Un devis est un point de départ, et nous restons à votre écoute pour ajuster les plans selon l’évolution de vos besoins."],
	['Choix de matériaux de qualité', "Nous sélectionnons des matériaux durables, car nous croyons fermement que la qualité est un investissement à long terme."],
];

/** Le libellé de l'engagement est en gras, comme sur l'ancienne page. */
const engagement = ([label, text]) => ({
	type: 'list-item',
	text: `${label} : ${text}`,
	spans: [{ start: 0, end: label.length, type: 'strong' }],
});

const associe = (name) => ({
	type: 'paragraph',
	text: `${name} — associé`,
	spans: [{ start: 0, end: name.length, type: 'strong' }],
});

const data = {
	eyebrow: "L'entreprise",
	title: 'À propos de nous',
	subtitle: '',
	lead: [
		{
			type: 'paragraph',
			// Le champ « Chapô » n'autorise que du texte simple : le gras porté
			// par « ACRE » sur l'ancienne page tombe ici.
			text: "Chez ACRE, nous mettons un point d’honneur à offrir un service de rénovation qui répond à vos attentes et au-delà.",
			spans: [],
		},
	],
	body: [
		{ type: 'heading2', text: 'Notre engagement', spans: [] },
		...engagements.map(engagement),
		{ type: 'heading2', text: 'Les associés', spans: [] },
		associe('Thomas Pereira'),
		associe('Timothée Dorocant'),
	],
	slices: [],
	meta_title: '',
	meta_description: '',
};

const writeClient = prismic.createWriteClient('3u0gsum3', {
	writeToken: process.env.PRISMIC_WRITE_TOKEN,
});

if (process.env.DOC_ID) {
	await writeClient.updateDocument(process.env.DOC_ID, {
		documentTitle: 'Entreprise',
		uid: process.env.DOC_UID || 'entreprise',
		data,
	});
	console.log(`document ${process.env.DOC_ID} rempli`);
} else {
	const uid = process.env.DOC_UID || 'entreprise';
	const { id } = await writeClient.createDocument(
		{ type: 'page', uid, lang: 'fr-fr', data: {} },
		'Entreprise',
	);
	console.log('document créé :', id, '/ uid', uid);
	await writeClient.updateDocument(id, { documentTitle: 'Entreprise', uid, data });
	console.log('document rempli');

	if (uid !== 'entreprise') {
		try {
			await writeClient.updateDocument(id, { documentTitle: 'Entreprise', uid: 'entreprise', data });
			console.log('uid basculé sur « entreprise »');
		} catch (error) {
			console.log('uid « entreprise » refusé :', error.response?.message ?? error.message);
		}
	}
}
