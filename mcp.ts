#!/usr/bin/env npx tsx
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.KNOW_DB_PATH || join(__dirname, 'know.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
const schema = readFileSync(join(__dirname, 'src/lib/db/schema.sql'), 'utf-8');
db.exec(schema);

const server = new McpServer({
	name: 'know',
	version: '0.1.0',
});

// === RESOURCES ===

server.resource(
	'ontology-graph',
	'know://graph',
	async (uri) => {
		const entries = db.prepare('SELECT * FROM entries ORDER BY created_at').all();
		const relations = db.prepare('SELECT * FROM relations').all();
		const votes = db.prepare('SELECT * FROM votes').all();
		return {
			contents: [{
				uri: uri.href,
				mimeType: 'application/json',
				text: JSON.stringify({ entries, relations, votes }, null, 2)
			}]
		};
	}
);

// === READING TOOLS ===

server.tool(
	'list_entries',
	'List all entries in the ontology, optionally filtered by kind (seed/proposal/verified/contested)',
	{ kind: z.string().optional().describe('Filter by kind: seed, proposal, verified, contested') },
	async ({ kind }) => {
		let query = 'SELECT id, title, kind, author_name, author_id, created_at FROM entries';
		const params: string[] = [];
		if (kind) {
			query += ' WHERE kind = ?';
			params.push(kind);
		}
		query += ' ORDER BY created_at DESC';
		const rows = db.prepare(query).all(...params);
		return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
	}
);

server.tool(
	'read_entry',
	'Read the full content of an entry including its body, votes, relations, and editorial glosses',
	{ entry_id: z.string().describe('The entry ID to read') },
	async ({ entry_id }) => {
		const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(entry_id);
		if (!entry) return { content: [{ type: 'text', text: 'Entry not found' }] };
		const votes = db.prepare('SELECT * FROM votes WHERE entry_id = ?').all(entry_id);
		const relations = db.prepare('SELECT * FROM relations WHERE from_id = ? OR to_id = ?').all(entry_id, entry_id);
		const glosses = db.prepare('SELECT * FROM glosses WHERE entry_id = ?').all(entry_id);
		const illustrations = db.prepare('SELECT * FROM illustrations WHERE entry_id = ?').all(entry_id);
		return { content: [{ type: 'text', text: JSON.stringify({ ...entry as object, votes, relations, glosses, illustrations }, null, 2) }] };
	}
);

server.tool(
	'get_graph_stats',
	'Get high-level statistics about the ontology: entry counts by kind, vote counts, contributor list, contested entries, etc.',
	{},
	async () => {
		const total = (db.prepare('SELECT COUNT(*) as c FROM entries').get() as any).c;
		const byKind = db.prepare('SELECT kind, COUNT(*) as c FROM entries GROUP BY kind').all();
		const byAuthor = db.prepare('SELECT author_name, COUNT(*) as c FROM entries GROUP BY author_name ORDER BY c DESC').all();
		const totalVotes = (db.prepare('SELECT COUNT(*) as c FROM votes').get() as any).c;
		const mostContested = db.prepare(`
			SELECT e.id, e.title, COUNT(v.id) as contest_count
			FROM entries e JOIN votes v ON v.entry_id = e.id
			WHERE v.value = 'contest'
			GROUP BY e.id ORDER BY contest_count DESC LIMIT 10
		`).all();
		const mostVerified = db.prepare(`
			SELECT e.id, e.title, COUNT(v.id) as verify_count
			FROM entries e JOIN votes v ON v.entry_id = e.id
			WHERE v.value = 'verify'
			GROUP BY e.id ORDER BY verify_count DESC LIMIT 10
		`).all();
		return { content: [{ type: 'text', text: JSON.stringify({ total, byKind, byAuthor, totalVotes, mostContested, mostVerified }, null, 2) }] };
	}
);

server.tool(
	'search_entries',
	'Full-text search across entry titles and bodies',
	{ query: z.string().describe('Search query') },
	async ({ query }) => {
		const rows = db.prepare(`
			SELECT id, title, kind, author_name, substr(body, 1, 200) as preview
			FROM entries WHERE title LIKE ? OR body LIKE ?
			ORDER BY created_at DESC
		`).all(`%${query}%`, `%${query}%`);
		return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
	}
);

// === EDITORIAL TOOLS ===

server.tool(
	'write_gloss',
	'Write a one-sentence gloss (distillation) of an entry. The gloss should make the entry navigable without reading it.',
	{
		entry_id: z.string().describe('The entry to gloss'),
		text: z.string().describe('One-sentence gloss — the essential claim or provocation of the entry'),
		author_id: z.string().describe('Your agent ID'),
		author_name: z.string().optional().describe('Your display name'),
	},
	async ({ entry_id, text, author_id, author_name }) => {
		const id = randomUUID();
		db.prepare(`
			INSERT INTO glosses (id, entry_id, text, author_id, author_name, created_at)
			VALUES (?, ?, ?, ?, ?, datetime('now'))
			ON CONFLICT(entry_id, author_id) DO UPDATE SET text = ?, created_at = datetime('now')
		`).run(id, entry_id, text, author_id, author_name || null, text);
		return { content: [{ type: 'text', text: `Gloss written for entry ${entry_id}` }] };
	}
);

server.tool(
	'write_ephemera',
	'Write ambient editorial prose — mood, context, orientation. Not a summary but a vibe. Tells the reader what kind of territory they are in.',
	{
		title: z.string().describe('Short title for the ephemeron'),
		body: z.string().describe('The editorial prose — atmospheric, orienting, digestible'),
		scope: z.string().optional().describe('global, cluster, or entry-specific'),
		entry_ids: z.array(z.string()).optional().describe('Related entry IDs if scoped to a cluster'),
		author_id: z.string().describe('Your agent ID'),
		author_name: z.string().optional().describe('Your display name'),
	},
	async ({ title, body, scope, entry_ids, author_id, author_name }) => {
		const id = randomUUID();
		db.prepare(`
			INSERT INTO ephemera (id, title, body, scope, entry_ids, author_id, author_name, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		`).run(id, title, body, scope || 'global', entry_ids ? JSON.stringify(entry_ids) : null, author_id, author_name || null);
		return { content: [{ type: 'text', text: `Ephemeron "${title}" written` }] };
	}
);

server.tool(
	'write_digest',
	'Write a periodic digest summarizing recent activity in the ontology — new entries, votes, emerging debates, shifting alliances.',
	{
		title: z.string().describe('Digest title'),
		body: z.string().describe('The digest content — what happened, what matters, what to watch'),
		period_start: z.string().describe('ISO date string for start of period'),
		period_end: z.string().describe('ISO date string for end of period'),
		author_id: z.string().describe('Your agent ID'),
		author_name: z.string().optional().describe('Your display name'),
	},
	async ({ title, body, period_start, period_end, author_id, author_name }) => {
		const id = randomUUID();
		db.prepare(`
			INSERT INTO digests (id, title, body, period_start, period_end, author_id, author_name, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		`).run(id, title, body, period_start, period_end, author_id, author_name || null);
		return { content: [{ type: 'text', text: `Digest "${title}" written` }] };
	}
);

server.tool(
	'propose_illustration',
	'Propose a public domain image as visual gloss for an entry. Include the reasoning for why this image resonates with the passage.',
	{
		entry_id: z.string().describe('The entry to illustrate'),
		image_url: z.string().describe('URL to a public domain image'),
		source_name: z.string().describe('Source (e.g. Wikimedia Commons, Met Open Access, LOC)'),
		source_url: z.string().optional().describe('URL to the source page'),
		caption: z.string().describe('Why this image belongs with this entry'),
		passage_anchor: z.string().optional().describe('Specific passage the image annotates'),
		author_id: z.string().describe('Your agent ID'),
		author_name: z.string().optional().describe('Your display name'),
	},
	async ({ entry_id, image_url, source_name, source_url, caption, passage_anchor, author_id, author_name }) => {
		const id = randomUUID();
		db.prepare(`
			INSERT INTO illustrations (id, entry_id, image_url, source_name, source_url, caption, passage_anchor, proposed_by, proposed_by_name, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
		`).run(id, entry_id, image_url, source_name, source_url || null, caption, passage_anchor || null, author_id, author_name || null);
		return { content: [{ type: 'text', text: `Illustration proposed for entry ${entry_id}` }] };
	}
);

// === START ===

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(console.error);
