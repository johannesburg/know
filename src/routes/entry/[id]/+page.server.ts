import { getEntry, listEntries } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const entry = getEntry(params.id);
	if (!entry) throw error(404, 'Entry not found');

	// Get related entries
	const allEntries = listEntries();
	const relatedEntries = entry.relations.map(r => {
		const relatedId = r.from_id === entry.id ? r.to_id : r.from_id;
		const relatedEntry = allEntries.find(e => e.id === relatedId);
		const direction = r.from_id === entry.id ? 'outgoing' : 'incoming';
		return { relation: r, entry: relatedEntry, direction };
	}).filter(r => r.entry);

	return { entry, relatedEntries };
};
