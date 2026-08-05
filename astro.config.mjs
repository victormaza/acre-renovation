// @ts-check
import { defineConfig, envField, sessionDrivers } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://acre-renovation.fr',

	// Une seule forme d'URL, sans slash final, pour que le lien canonique, les
	// liens internes et le `html_handling` de wrangler.jsonc disent la même chose.
	trailingSlash: 'never',

	// Le site reste statique : `output` vaut toujours 'static' et toutes les
	// pages sont prérendues. L'adapter n'est là que pour la seule route qui
	// demande un serveur — `src/pages/api/devis.ts`, marquée `prerender = false`.
	// C'est aussi le levier qu'il faudrait pour ouvrir les previews Prismic.
	// `passthrough` : aucune image ne passe par `astro:assets`. Les photos
	// viennent du CDN Prismic via `Photo.astro`, qui produit lui-même son
	// srcset. Sans ça, l'adapter réclame un binding Cloudflare Images inutile.
	adapter: cloudflare({ imageService: 'passthrough' }),

	// Aucune session n'est utilisée : la seule route serveur est un POST sans
	// état. Sans ce pilote explicite, l'adapter provisionne un namespace KV au
	// déploiement pour un stockage dont personne ne se sert.
	session: { driver: sessionDrivers.null() },

	env: {
		schema: {
			// Tous en `secret` : la valeur est lue à l'exécution dans l'env du
			// Worker, qui agrège les `vars` de wrangler.jsonc et les secrets posés
			// par `wrangler secret put`. En local, elles viennent de `.env`.
			// `optional` pour que l'absence donne une erreur explicite dans la
			// route plutôt qu'un plantage du Worker au démarrage.
			BREVO_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			DEVIS_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
			DEVIS_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
});
