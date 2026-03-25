import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEntry } from '$lib/db';

// GET /api/v1/entries/:id — get a single entry with relations and votes
export const GET: RequestHandler = async ({ params }) => {
	const entry = getEntry(params.id);
	if (!entry) {
		return json({ error: 'entry not found' }, { status: 404 });
	}
	return json({ entry });
};
