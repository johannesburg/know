import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Entry, EntrySubmission, VoteSubmission, IllustrationSubmission, ShaderSubmission, Relation, Vote, Illustration, Shader, OntologyGraph } from '$lib/types/ontology';

const DB_PATH = process.env.KNOW_DB_PATH || 'know.db';

let db: Database.Database;

function getDb(): Database.Database {
	if (!db) {
		db = new Database(DB_PATH);
		db.pragma('journal_mode = WAL');
		db.pragma('foreign_keys = ON');
		const schema = readFileSync(join(import.meta.dirname, 'schema.sql'), 'utf-8');
		db.exec(schema);
	}
	return db;
}

export function createEntry(submission: EntrySubmission): Entry {
	const d = getDb();
	const id = randomUUID();
	const now = new Date().toISOString();

	d.prepare(`
		INSERT INTO entries (id, title, body, kind, author_type, author_id, author_name, parent_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(id, submission.title, submission.body, submission.author_type === 'human' ? 'seed' : 'proposal', submission.author_type, submission.author_id, submission.author_name || null, submission.parent_id || null, now, now);

	if (submission.relations) {
		for (const rel of submission.relations) {
			d.prepare(`
				INSERT INTO relations (id, from_id, to_id, kind, created_by, created_at)
				VALUES (?, ?, ?, ?, ?, ?)
			`).run(randomUUID(), id, rel.to_id, rel.kind, submission.author_id, now);
		}
	}

	return getEntry(id)!;
}

export function getEntry(id: string): Entry | null {
	const d = getDb();
	const row = d.prepare('SELECT * FROM entries WHERE id = ?').get(id) as Record<string, string> | undefined;
	if (!row) return null;

	const relations = d.prepare('SELECT * FROM relations WHERE from_id = ? OR to_id = ?').all(id, id) as Relation[];
	const votes = d.prepare('SELECT * FROM votes WHERE entry_id = ?').all(id) as Vote[];
	const illustrations = d.prepare('SELECT * FROM illustrations WHERE entry_id = ?').all(id) as Illustration[];
	const shaders = d.prepare('SELECT * FROM shaders WHERE entry_id = ?').all(id) as Shader[];

	return { ...row, relations, votes, illustrations, shaders } as unknown as Entry;
}

export function listEntries(opts?: { kind?: string; limit?: number; offset?: number }): Entry[] {
	const d = getDb();
	let query = 'SELECT * FROM entries';
	const params: (string | number)[] = [];

	if (opts?.kind) {
		query += ' WHERE kind = ?';
		params.push(opts.kind);
	}

	query += ' ORDER BY created_at DESC';

	if (opts?.limit) {
		query += ' LIMIT ?';
		params.push(opts.limit);
	}
	if (opts?.offset) {
		query += ' OFFSET ?';
		params.push(opts.offset);
	}

	const rows = d.prepare(query).all(...params) as Record<string, string>[];
	return rows.map((row) => {
		const relations = d.prepare('SELECT * FROM relations WHERE from_id = ? OR to_id = ?').all(row.id, row.id) as Relation[];
		const votes = d.prepare('SELECT * FROM votes WHERE entry_id = ?').all(row.id) as Vote[];
		const illustrations = d.prepare('SELECT * FROM illustrations WHERE entry_id = ?').all(row.id) as Illustration[];
		const shaders = d.prepare('SELECT * FROM shaders WHERE entry_id = ?').all(row.id) as Shader[];
		return { ...row, relations, votes, illustrations, shaders } as unknown as Entry;
	});
}

export function castVote(submission: VoteSubmission): Vote {
	const d = getDb();
	const id = randomUUID();
	const now = new Date().toISOString();

	d.prepare(`
		INSERT INTO votes (id, entry_id, agent_id, value, reasoning, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(entry_id, agent_id) DO UPDATE SET value = ?, reasoning = ?, created_at = ?
	`).run(id, submission.entry_id, submission.agent_id, submission.value, submission.reasoning, now, submission.value, submission.reasoning, now);

	// Update entry kind based on votes
	updateEntryKind(submission.entry_id);

	return {
		id,
		entry_id: submission.entry_id,
		agent_id: submission.agent_id,
		value: submission.value,
		reasoning: submission.reasoning,
		created_at: now
	};
}

function updateEntryKind(entryId: string) {
	const d = getDb();
	const entry = d.prepare('SELECT kind FROM entries WHERE id = ?').get(entryId) as Record<string, string> | undefined;
	if (!entry || entry.kind === 'seed') return; // seeds don't change

	const votes = d.prepare('SELECT value, COUNT(*) as count FROM votes WHERE entry_id = ? GROUP BY value').all(entryId) as { value: string; count: number }[];
	const verifyCount = votes.find((v) => v.value === 'verify')?.count || 0;
	const contestCount = votes.find((v) => v.value === 'contest')?.count || 0;

	let newKind = 'proposal';
	if (verifyCount >= 3 && contestCount === 0) newKind = 'verified';
	else if (contestCount >= 2) newKind = 'contested';

	d.prepare(`UPDATE entries SET kind = ?, updated_at = datetime('now') WHERE id = ?`).run(newKind, entryId);
}

export function getFullGraph(): OntologyGraph {
	const d = getDb();
	const entries = listEntries();
	const relations = d.prepare('SELECT * FROM relations').all() as Relation[];

	const nodes = entries.map((e) => ({
		id: e.id,
		title: e.title,
		kind: e.kind,
		depth: e.parent_id ? 1 : 0
	}));

	const edges = relations.map((r) => ({
		from: r.from_id,
		to: r.to_id,
		kind: r.kind
	}));

	return { nodes, edges, entries };
}

export function addShader(submission: ShaderSubmission): Shader {
	const d = getDb();
	const id = randomUUID();
	const now = new Date().toISOString();

	d.prepare(`
		INSERT INTO shaders (id, entry_id, fragment_source, description, proposed_by, proposed_by_name, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(entry_id, proposed_by) DO UPDATE SET fragment_source = ?, description = ?, created_at = ?
	`).run(id, submission.entry_id, submission.fragment_source, submission.description, submission.proposed_by, submission.proposed_by_name || null, now, submission.fragment_source, submission.description, now);

	return { id, ...submission, created_at: now } as Shader;
}

export function addIllustration(submission: IllustrationSubmission): Illustration {
	const d = getDb();
	const id = randomUUID();
	const now = new Date().toISOString();

	d.prepare(`
		INSERT INTO illustrations (id, entry_id, image_url, source_name, source_url, caption, passage_anchor, proposed_by, proposed_by_name, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(id, submission.entry_id, submission.image_url, submission.source_name, submission.source_url || null, submission.caption, submission.passage_anchor || null, submission.proposed_by, submission.proposed_by_name || null, now);

	return { id, ...submission, created_at: now } as Illustration;
}

export function seedEntry(title: string, body: string, authorId: string = 'johan'): Entry {
	return createEntry({
		title,
		body,
		author_type: 'human',
		author_id: authorId,
		author_name: 'Johan Michalove'
	});
}
