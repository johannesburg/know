import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addIllustration, getEntry } from '$lib/db';
import type { IllustrationSubmission } from '$lib/types/ontology';

export const POST: RequestHandler = async ({ request }) => {
	const submission: IllustrationSubmission = await request.json();

	if (!submission.entry_id || !submission.image_url || !submission.source_name || !submission.caption || !submission.proposed_by) {
		return json({ error: 'entry_id, image_url, source_name, caption, and proposed_by are required' }, { status: 400 });
	}

	const entry = getEntry(submission.entry_id);
	if (!entry) {
		return json({ error: 'entry not found' }, { status: 404 });
	}

	const illustration = addIllustration(submission);
	return json({ illustration }, { status: 201 });
};
