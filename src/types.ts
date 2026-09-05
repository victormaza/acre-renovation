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

export interface NavLink {
	label: string;
	href: string;
}

/** Entrée de navigation : soit un lien, soit un menu déroulant. */
export interface NavItem extends Partial<NavLink> {
	label: string;
	children?: NavLink[];
}

/**
 * Ce que la page rendue transmet à ses slices, en plus de leur propre contenu.
 *
 * Une slice partagée ne sait pas d'elle-même sur quelle page elle est posée.
 * `realisations` en a besoin : sur une page expertise, son repli automatique
 * doit se limiter aux chantiers de *cette* expertise, pas aux derniers publiés
 * tous types confondus.
 */
export interface SliceContext {
	/** ID du document `expertise` dont la page rend cette slice. */
	expertiseId?: string;
}

/** Une photo de chantier autre que la couverture, avec sa légende. */
export interface RealisationPhoto {
	field?: ImageFieldImage | null;
	caption?: string;
}

/**
 * Une carte de chantier, telle que l'affichent la section de l'accueil et la
 * page Réalisations. Les deux passent par le même composant de grille.
 *
 * Pas de `href` : la carte ne mène à aucune page, elle agrandit ses photos. La
 * cible du lien est dérivée des images par la grille elle-même.
 */
export interface RealisationCard {
	city: string;
	title: string;
	meta: string;
	/** La couverture : la seule photo que la carte montre. */
	image: PhotoInput;
	/** Les suivantes, visibles seulement dans la visionneuse. */
	gallery?: RealisationPhoto[];
}
