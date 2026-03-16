-- Add content_hash column for entry-level deduplication
ALTER TABLE knowledge_entries ADD COLUMN IF NOT EXISTS content_hash CHAR(64);

-- Backfill hashes for existing rows
UPDATE knowledge_entries
SET content_hash = encode(sha256(
  (lower(trim(title)) || E'\0' || lower(trim(content)))::bytea
), 'hex')
WHERE content_hash IS NULL;

-- Delete duplicates (keep lowest id)
DELETE FROM knowledge_entries a
USING knowledge_entries b
WHERE a.content_hash = b.content_hash
  AND a.id > b.id;

-- Create unique partial index
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_entries_content_hash
ON knowledge_entries (content_hash) WHERE content_hash IS NOT NULL;
