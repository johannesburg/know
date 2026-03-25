import { getFullGraph } from '$lib/db';
import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const graph = getFullGraph();

	// Load editorial content from JSON files if they exist
	const editorialDir = join(import.meta.dirname, '../../../editorial');
	let glosses: Record<string, string> = {};
	let ephemera: Array<{ title: string; body: string; scope: string; related_entries?: string[] }> = [];
	let illustrations: Array<{ entry_title: string; entry_id: string; image_url: string; source_name: string; caption: string }> = [];

	try {
		const glossPath = join(editorialDir, 'glosses.json');
		if (existsSync(glossPath)) {
			const raw = JSON.parse(readFileSync(glossPath, 'utf-8'));
			for (const g of raw) {
				glosses[g.entry_id || g.entry_title] = g.gloss;
			}
		}
	} catch {}

	try {
		const ephPath = join(editorialDir, 'ephemera.json');
		if (existsSync(ephPath)) {
			ephemera = JSON.parse(readFileSync(ephPath, 'utf-8'));
		}
	} catch {}

	try {
		const illPath = join(editorialDir, 'illustrations.json');
		if (existsSync(illPath)) {
			illustrations = JSON.parse(readFileSync(illPath, 'utf-8'));
		}
	} catch {}

	return { graph, glosses, ephemera, illustrations };
};
