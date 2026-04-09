CREATE TABLE IF NOT EXISTS notes (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  content     TEXT NOT NULL,
  type        VARCHAR(20) NOT NULL DEFAULT 'general',
  tags        TEXT[] DEFAULT '{}',
  is_pinned   BOOLEAN DEFAULT false,
  user_id     TEXT REFERENCES "user"(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user    ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_type    ON notes(type, user_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags    ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_pinned  ON notes(is_pinned, user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
