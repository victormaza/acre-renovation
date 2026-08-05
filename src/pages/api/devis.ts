import type { APIRoute } from 'astro';
import { BREVO_API_KEY, DEVIS_FROM_EMAIL, DEVIS_TO_EMAIL } from 'astro:env/server';
import {
	budgets,
	inZoneCities,
	inZonePostalPrefixes,
	normalizeCity,
	projectTypes,
	propertyTypes,
	surfaces,
	timings,
} from '../../data/devis';

// Seule route du site rendue à la demande. Tout le reste est prérendu : c'est
// la raison d'être de l'adapter Cloudflare dans `astro.config.mjs`.
export const prerender = false;

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/** Délai minimal entre l'affichage du formulaire et l'envoi, en millisecondes. */
const MIN_FILL_MS = 3000;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isPhone = (value: string) => value.replace(/[^\d+]/g, '').length >= 9;

const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"']/g,
		(char) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string
	);

/**
 * Les listes de `data/devis.ts` font office de référentiel : une valeur qui n'en
 * vient pas a été fabriquée à la main, on la jette plutôt que de la relayer
 * telle quelle dans la boîte du client.
 */
const pickFrom = (choices: { label: string }[], value: unknown) => {
	const label = typeof value === 'string' ? value.trim() : '';
	return choices.some((choice) => choice.label === label) ? label : '';
};

const clamp = (value: unknown, max: number) =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

function isInZone(location: string) {
	const value = normalizeCity(location);
	if (/^\d{5}$/.test(value)) return inZonePostalPrefixes.some((prefix) => value.startsWith(prefix));
	return value.length > 0 && inZoneCities.some((city) => city.includes(value) || value.includes(city));
}

interface Lead {
	projectType: string;
	propertyType: string;
	surface: string;
	location: string;
	budget: string;
	timing: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	description: string;
}

function buildEmail(lead: Lead) {
	const rows: [string, string][] = [
		['Projet', lead.projectType],
		['Type de bien', lead.propertyType],
		['Surface', lead.surface],
		['Localisation', lead.location + (lead.location && !isInZone(lead.location) ? ' (hors zone habituelle)' : '')],
		['Budget', lead.budget],
		['Échéance', lead.timing],
		['Prénom', lead.firstName],
		['Nom', lead.lastName],
		['Email', lead.email],
		['Téléphone', lead.phone],
	].filter(([, value]) => value !== '');

	const text = [
		...rows.map(([label, value]) => `${label} : ${value}`),
		...(lead.description ? ['', 'Description :', lead.description] : []),
	].join('\n');

	const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#211c17">
<h1 style="font-size:18px;margin:0 0 16px">Nouvelle demande de devis</h1>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows
	.map(
		([label, value]) =>
			`<tr><td style="padding:6px 16px 6px 0;color:#7a7162;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>`
	)
	.join('\n')}
</table>
${lead.description ? `<p style="margin:20px 0 6px;color:#7a7162">Description</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.description)}</p>` : ''}
</div>`;

	const who = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
	const subject = [lead.projectType || 'Demande de devis', lead.location, who]
		.filter(Boolean)
		.join(' · ');

	return { subject, text, html };
}

export const POST: APIRoute = async ({ request }) => {
	const contentType = request.headers.get('content-type') ?? '';
	const wantsJson = contentType.includes('application/json');

	// Réponse adaptée au canal : JSON pour le fetch du configurateur, redirection
	// pour l'envoi natif du formulaire quand le JavaScript n'a pas pris la main.
	const reply = (status: number, error?: string) => {
		if (wantsJson) {
			return new Response(JSON.stringify(error ? { ok: false, error } : { ok: true }), {
				status,
				headers: { 'content-type': 'application/json' },
			});
		}
		if (!error) return new Response(null, { status: 303, headers: { location: '/devis/merci' } });
		return new Response(
			`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Envoi impossible</title><body style="font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1.5rem;line-height:1.6"><h1>Votre demande n'a pas pu être envoyée</h1><p>${escapeHtml(error)}</p><p><a href="/devis">Revenir au formulaire</a></p>`,
			{ status, headers: { 'content-type': 'text/html; charset=utf-8' } }
		);
	};

	let data: Record<string, unknown>;
	try {
		data = wantsJson
			? await request.json()
			: Object.fromEntries(await request.formData());
	} catch {
		return reply(400, 'Requête illisible.');
	}

	// Piège à robots : rempli, donc pas un humain. On répond 200 pour ne rien
	// apprendre à l'émetteur, mais rien n'est envoyé.
	if (clamp(data.societe, 200)) return reply(200);

	const openedAt = Number(data.ts);
	if (Number.isFinite(openedAt) && openedAt > 0 && Date.now() - openedAt < MIN_FILL_MS) {
		return reply(200);
	}

	const lead: Lead = {
		projectType: pickFrom(projectTypes, data.projectType),
		propertyType: pickFrom(propertyTypes, data.propertyType),
		surface: pickFrom(surfaces, data.surface),
		location: clamp(data.location, 120),
		budget: pickFrom(budgets, data.budget),
		timing: pickFrom(timings, data.timing),
		firstName: clamp(data.firstName, 80),
		lastName: clamp(data.lastName, 80),
		email: clamp(data.email, 160),
		phone: clamp(data.phone, 40),
		description: clamp(data.description, 4000),
	};

	// Mêmes règles que le navigateur : prénom, un moyen de contact valide, et le
	// consentement. Volontairement peu exigeant — chaque champ obligatoire de
	// plus est un abandon de plus.
	const hasContact =
		(lead.email && isEmail(lead.email)) || (lead.phone && isPhone(lead.phone));
	if (!lead.firstName || !hasContact) {
		return reply(400, 'Indiquez votre prénom et au moins un email ou un téléphone valide.');
	}
	if (!clamp(data.consent, 10)) {
		return reply(400, 'Le consentement est nécessaire pour traiter votre demande.');
	}

	if (!BREVO_API_KEY || !DEVIS_TO_EMAIL || !DEVIS_FROM_EMAIL) {
		console.error(
			'Configuration email incomplète : BREVO_API_KEY, DEVIS_TO_EMAIL et DEVIS_FROM_EMAIL doivent être définies.'
		);
		return reply(500, "Le formulaire n'est pas encore configuré. Merci de nous appeler directement.");
	}

	const { subject, text, html } = buildEmail(lead);

	const response = await fetch(BREVO_ENDPOINT, {
		method: 'POST',
		headers: {
			'api-key': BREVO_API_KEY,
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			sender: { name: 'Site Acre Rénovation', email: DEVIS_FROM_EMAIL },
			to: [{ email: DEVIS_TO_EMAIL }],
			// Répondre depuis la boîte du client tombe alors directement chez le
			// prospect, sans copier-coller d'adresse.
			...(lead.email && isEmail(lead.email)
				? { replyTo: { email: lead.email, name: [lead.firstName, lead.lastName].filter(Boolean).join(' ') } }
				: {}),
			subject: `Devis — ${subject}`,
			textContent: text,
			htmlContent: html,
		}),
	});

	if (!response.ok) {
		console.error(`Brevo a répondu ${response.status} : ${await response.text()}`);
		return reply(502, "L'envoi a échoué. Merci de réessayer dans un instant.");
	}

	return reply(200);
};
