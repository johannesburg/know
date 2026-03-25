import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addShader, getEntry } from '$lib/db';
import type { ShaderSubmission } from '$lib/types/ontology';

export const POST: RequestHandler = async ({ request }) => {
	const submission: ShaderSubmission = await request.json();

	if (!submission.entry_id || !submission.fragment_source || !submission.description || !submission.proposed_by) {
		return json({ error: 'entry_id, fragment_source, description, and proposed_by are required' }, { status: 400 });
	}

	const entry = getEntry(submission.entry_id);
	if (!entry) {
		return json({ error: 'entry not found' }, { status: 404 });
	}

	const shader = addShader(submission);
	return json({ shader }, { status: 201 });
};
