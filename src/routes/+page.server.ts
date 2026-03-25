import { getFullGraph } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const graph = getFullGraph();
	return { graph };
};
