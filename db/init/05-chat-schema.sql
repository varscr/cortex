-- Chat sessions and messages for RAG-powered assistant

CREATE TABLE IF NOT EXISTS chat_sessions (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(200),
  model_provider VARCHAR(50)  NOT NULL DEFAULT 'claude-code',
  model_name     VARCHAR(100) NOT NULL DEFAULT 'claude-sonnet-4-6',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          SERIAL PRIMARY KEY,
  session_id  INTEGER     NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL,  -- 'user' | 'assistant'
  content     TEXT        NOT NULL,
  sources     JSONB       DEFAULT '[]',
  token_count INTEGER,
  duration_ms INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);
