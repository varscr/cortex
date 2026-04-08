-- Add color and tasks columns to kanban_cards
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS tasks JSONB NOT NULL DEFAULT '[]';
