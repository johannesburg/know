import { getFullGraph } from '$lib/db';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const graph = getFullGraph();

	let glosses: Record<string, string> = {};
	let illustrations: Array<Record<string, string>> = [];

	try {
		const dir = join(process.cwd(), 'editorial');
		const glossPath = join(dir, 'glosses.json');
		if (existsSync(glossPath)) {
			const raw = JSON.parse(readFileSync(glossPath, 'utf-8'));
			for (const g of raw) {
				glosses[g.entry_id || g.entry_title] = g.gloss;
			}
		}
		const illPath = join(dir, 'illustrations.json');
		if (existsSync(illPath)) {
			illustrations = JSON.parse(readFileSync(illPath, 'utf-8'));
		}
	} catch {}

	return { graph, glosses, illustrations };
};
