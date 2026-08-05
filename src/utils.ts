/**
 * Transforme un libellé en identifiant d'ancre stable.
 * Les ancres des expertises sont dérivées de leur titre plutôt que saisies :
 * réordonner les cartes dans Prismic ne casse alors pas les liens.
 */
export function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
