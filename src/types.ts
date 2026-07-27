import type { ImageFieldImage } from '@prismicio/client';

/**
 * Ce que les composants acceptent partout où le design prévoit une photo.
 * `field` vient de Prismic, `src` couvre une image statique, et sans les deux
 * c'est le placeholder du prototype qui s'affiche.
 */
export interface PhotoInput {
	field?: ImageFieldImage | null;
	src?: string;
	alt?: string;
	placeholder?: string;
	sizes?: string;
}

export interface CtaInput {
	label: string;
	href: string;
}
