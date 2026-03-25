import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFullGraph } from '$lib/db';

// GET /api/v1/graph — full ontology graph (nodes + edges + entries)
// This is the "get drunk" endpoint. No pagination. The whole thing.
export const GET: RequestHandler = async () => {
	const graph = getFullGraph();
	return json(graph);
};
