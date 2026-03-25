import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createEntry, listEntries } from '$lib/db';
import type { EntrySubmission } from '$lib/types/ontology';

// GET /api/v1/entries — list entries, optional ?kind=seed|proposal|verified|contested
export const GET: RequestHandler = async ({ url }) => {
	const kind = url.searchParams.get('kind') || undefined;
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const entries = listEntries({ kind, limit, offset });
	return json({ entries, count: entries.length });
};

// POST /api/v1/entries — submit a new entry
export const POST: RequestHandler = async ({ request }) => {
	const submission: EntrySubmission = await request.json();

	if (!submission.title || !submission.body || !submission.author_id) {
		return json({ error: 'title, body, and author_id are required' }, { status: 400 });
	}

	if (!submission.author_type) {
		submission.author_type = 'agent';
	}

	const entry = createEntry(submission);
	return json({ entry }, { status: 201 });
};
