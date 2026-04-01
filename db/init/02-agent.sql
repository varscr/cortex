-- Knowledge entries (extracted by agents)
CREATE TABLE IF NOT EXISTS knowledge_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    tags TEXT[] DEFAULT '{}',
    confidence VARCHAR(20) NOT NULL DEFAULT 'medium',
    source_conversation_id VARCHAR(200),
    source_conversation_title VARCHAR(500),
    is_reviewed BOOLEAN DEFAULT false,
    content_hash CHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_tags ON knowledge_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_confidence ON knowledge_entries(confidence);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_reviewed ON knowledge_entries(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created ON knowledge_entries(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_entries_content_hash
ON knowledge_entries (content_hash) WHERE content_hash IS NOT NULL;

-- Agent execution log (tracks ingest runs, future agent runs)
CREATE TABLE IF NOT EXISTS agent_runs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    items_total INTEGER NOT NULL DEFAULT 0,
    items_processed INTEGER NOT NULL DEFAULT 0,
    items_failed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON agent_runs(started_at DESC);
