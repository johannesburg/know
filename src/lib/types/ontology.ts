export interface Entry {
	id: string;
	title: string;
	body: string; // markdown
	kind: 'seed' | 'proposal' | 'verified' | 'contested';
	author_type: 'human' | 'agent';
	author_id: string;
	author_name?: string;
	parent_id?: string; // if this enhances/extends another entry
	relations: Relation[];
	votes: Vote[];
	illustrations: Illustration[];
	shaders: Shader[];
	created_at: string;
	updated_at: string;
}

export interface Relation {
	id: string;
	from_id: string;
	to_id: string;
	kind: 'extends' | 'contradicts' | 'supports' | 'defines' | 'requires';
	created_by: string;
	created_at: string;
}

export interface Vote {
	id: string;
	entry_id: string;
	agent_id: string;
	value: 'verify' | 'contest' | 'enhance';
	reasoning: string;
	created_at: string;
}

export interface EntrySubmission {
	title: string;
	body: string;
	author_type: 'human' | 'agent';
	author_id: string;
	author_name?: string;
	parent_id?: string;
	relations?: {
		to_id: string;
		kind: Relation['kind'];
	}[];
}

export interface VoteSubmission {
	entry_id: string;
	agent_id: string;
	value: Vote['value'];
	reasoning: string;
}

export interface Illustration {
	id: string;
	entry_id: string;
	image_url: string; // public domain image URL
	source_name: string; // e.g. "Wikimedia Commons", "Met Open Access"
	source_url?: string;
	caption: string; // agent's reasoning for why this image glosses the passage
	passage_anchor?: string; // substring of the entry body this image annotates
	proposed_by: string;
	proposed_by_name?: string;
	created_at: string;
}

export interface IllustrationSubmission {
	entry_id: string;
	image_url: string;
	source_name: string;
	source_url?: string;
	caption: string;
	passage_anchor?: string;
	proposed_by: string;
	proposed_by_name?: string;
}

export interface Shader {
	id: string;
	entry_id: string;
	fragment_source: string; // GLSL fragment shader, one-liner or compressed
	description: string; // agent's reasoning for why this visual fits the entry
	proposed_by: string;
	proposed_by_name?: string;
	created_at: string;
}

export interface ShaderSubmission {
	entry_id: string;
	fragment_source: string;
	description: string;
	proposed_by: string;
	proposed_by_name?: string;
}

export interface GraphNode {
	id: string;
	title: string;
	kind: Entry['kind'];
	depth: number;
}

export interface GraphEdge {
	from: string;
	to: string;
	kind: Relation['kind'];
}

export interface OntologyGraph {
	nodes: GraphNode[];
	edges: GraphEdge[];
	entries: Entry[];
}
