/**
 * Synchronisation du schéma Prismic avec le dépôt.
 *
 *   npm run types:pull   Prismic → Git   (après avoir modélisé dans l'UI)
 *   npm run types:push   Git → Prismic   (après avoir édité le JSON à la main)
 *
 * Slice Machine ne supportant pas Astro, c'est ce script qui tient la règle
 * « le contenu vit chez Prismic, le schéma reste chez nous ». Le JSON est la
 * source de vérité versionnée ; l'UI Prismic reste utilisable pour modéliser,
 * à condition de lancer un pull derrière et de committer.
 *
 * Requiert PRISMIC_CUSTOM_TYPES_TOKEN dans .env (jamais commité).
 * Le jeton se crée dans Prismic → Settings → API & Security → Custom Types API.
 */

import { createClient } from '@prismicio/custom-types-client';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import 'dotenv/config';

// Doit rester aligné avec `repositoryName` de src/prismicio.ts.
// Le client envoie cette valeur telle quelle dans l'en-tête `repository`.
const REPOSITORY = '3u0gsum3';
const CUSTOM_TYPES_DIR = 'customtypes';
const SLICES_DIR = join('src', 'slices');

const token = process.env.PRISMIC_CUSTOM_TYPES_TOKEN;
if (!token) {
	console.error('PRISMIC_CUSTOM_TYPES_TOKEN manquant. Voir .env.example.');
	process.exit(1);
}

const client = createClient({ repositoryName: REPOSITORY, token });

const writeJSON = async (path, data) => {
	await mkdir(join(...path.split('/').slice(0, -1)), { recursive: true });
	await writeFile(path, JSON.stringify(data, null, 2) + '\n');
};

/** Liste les sous-dossiers contenant le fichier attendu. */
const localModels = async (dir, filename) => {
	if (!existsSync(dir)) return [];
	const entries = await readdir(dir, { withFileTypes: true });
	const models = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const path = join(dir, entry.name, filename);
		if (!existsSync(path)) continue;
		models.push({ path, model: JSON.parse(await readFile(path, 'utf8')) });
	}
	return models;
};

async function pull() {
	const [customTypes, slices] = await Promise.all([
		client.getAllCustomTypes(),
		client.getAllSharedSlices(),
	]);

	for (const customType of customTypes) {
		await writeJSON(`${CUSTOM_TYPES_DIR}/${customType.id}/index.json`, customType);
	}
	for (const slice of slices) {
		await writeJSON(`${SLICES_DIR}/${slice.id}/model.json`, slice);
	}

	console.log(`↓ ${customTypes.length} custom type(s), ${slices.length} slice(s) récupérés.`);
	console.log('  Pense à committer.');
}

async function push() {
	const [remoteTypes, remoteSlices] = await Promise.all([
		client.getAllCustomTypes(),
		client.getAllSharedSlices(),
	]);
	const remoteTypeIDs = new Set(remoteTypes.map((t) => t.id));
	const remoteSliceIDs = new Set(remoteSlices.map((s) => s.id));

	for (const { model } of await localModels(CUSTOM_TYPES_DIR, 'index.json')) {
		const exists = remoteTypeIDs.has(model.id);
		await (exists ? client.updateCustomType(model) : client.insertCustomType(model));
		console.log(`↑ custom type ${model.id} ${exists ? 'mis à jour' : 'créé'}`);
	}

	for (const { model } of await localModels(SLICES_DIR, 'model.json')) {
		const exists = remoteSliceIDs.has(model.id);
		await (exists ? client.updateSharedSlice(model) : client.insertSharedSlice(model));
		console.log(`↑ slice ${model.id} ${exists ? 'mise à jour' : 'créée'}`);
	}
}

const command = process.argv[2];
if (command !== 'pull' && command !== 'push') {
	console.error('Usage : node scripts/prismic-types.mjs <pull|push>');
	process.exit(1);
}

try {
	await (command === 'pull' ? pull() : push());
} catch (error) {
	console.error(`Échec du ${command} :`, error.message);
	process.exit(1);
}
