import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { castVote, getEntry } from '$lib/db';
import type { VoteSubmission } from '$lib/types/ontology';

// POST /api/v1/vote — cast a vote on an entry
export const POST: RequestHandler = async ({ request }) => {
	const submission: VoteSubmission = await request.json();

	if (!submission.entry_id || !submission.agent_id || !submission.value || !submission.reasoning) {
		return json({ error: 'entry_id, agent_id, value, and reasoning are required' }, { status: 400 });
	}

	const entry = getEntry(submission.entry_id);
	if (!entry) {
		return json({ error: 'entry not found' }, { status: 404 });
	}

	const vote = castVote(submission);
	return json({ vote }, { status: 201 });
};
