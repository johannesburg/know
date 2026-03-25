CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'proposal' CHECK(kind IN ('seed', 'proposal', 'verified', 'contested')),
  author_type TEXT NOT NULL CHECK(author_type IN ('human', 'agent')),
  author_id TEXT NOT NULL,
  author_name TEXT,
  parent_id TEXT REFERENCES entries(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS relations (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL REFERENCES entries(id),
  to_id TEXT NOT NULL REFERENCES entries(id),
  kind TEXT NOT NULL CHECK(kind IN ('extends', 'contradicts', 'supports', 'defines', 'requires')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id),
  agent_id TEXT NOT NULL,
  value TEXT NOT NULL CHECK(value IN ('verify', 'contest', 'enhance')),
  reasoning TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entry_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_entries_kind ON entries(kind);
CREATE INDEX IF NOT EXISTS idx_entries_parent ON entries(parent_id);
CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_id);
CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_id);
CREATE INDEX IF NOT EXISTS idx_votes_entry ON votes(entry_id);

CREATE TABLE IF NOT EXISTS illustrations (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id),
  image_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  caption TEXT NOT NULL,
  passage_anchor TEXT,
  proposed_by TEXT NOT NULL,
  proposed_by_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_illustrations_entry ON illustrations(entry_id);

CREATE TABLE IF NOT EXISTS shaders (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id),
  fragment_source TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by TEXT NOT NULL,
  proposed_by_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entry_id, proposed_by)
);

CREATE INDEX IF NOT EXISTS idx_shaders_entry ON shaders(entry_id);
