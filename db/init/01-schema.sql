-- Cortex database schema
-- Runs automatically on first 'docker compose up' via POSTGRES_DB=cortex_db

-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================
-- PERSONAL FINANCES
-- ================================
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    type VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_summary (
    id SERIAL PRIMARY KEY,
    month DATE NOT NULL,
    total_income DECIMAL(12,2),
    total_expenses DECIMAL(12,2),
    total_savings DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month)
);

-- ================================
-- LOG ENTRIES
-- ================================
CREATE TABLE IF NOT EXISTS log_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT NOT NULL,
    tags TEXT[],
    mood VARCHAR(20),
    entry_type VARCHAR(30) DEFAULT 'journal',
    is_pinned BOOLEAN DEFAULT false,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- KANBAN BOARDS
-- ================================
CREATE TABLE IF NOT EXISTS kanban_boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kanban_columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kanban_cards (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    tags TEXT[],
    position INTEGER NOT NULL DEFAULT 0,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- DOCUMENTS (pgvector embeddings)
-- ================================
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536),
    source VARCHAR(500) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- PROFILE
-- ================================
CREATE TABLE IF NOT EXISTS profile_about (
    id SERIAL PRIMARY KEY,
    headline VARCHAR(200),
    bio TEXT,
    location VARCHAR(200),
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_education (
    id SERIAL PRIMARY KEY,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_experience (
    id SERIAL PRIMARY KEY,
    company VARCHAR(200) NOT NULL,
    role VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_goals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    target_date DATE,
    category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_links (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(100),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    repo_url VARCHAR(500),
    tech_stack TEXT[] DEFAULT '{}',
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    proficiency INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_entries_tags ON log_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_log_entries_type ON log_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_log_entries_pinned ON log_entries(is_pinned);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board ON kanban_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board_pos ON kanban_columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column_pos ON kanban_cards(column_id, position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_tags ON kanban_cards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_due ON kanban_cards(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_profile_skills_category ON profile_skills(category);
CREATE INDEX IF NOT EXISTS idx_profile_experience_current ON profile_experience(is_current);
CREATE INDEX IF NOT EXISTS idx_profile_experience_start ON profile_experience(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_profile_projects_featured ON profile_projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_profile_projects_tech_stack ON profile_projects USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_profile_education_current ON profile_education(is_current);
CREATE INDEX IF NOT EXISTS idx_profile_education_start ON profile_education(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_profile_links_position ON profile_links(position);
CREATE INDEX IF NOT EXISTS idx_profile_goals_status ON profile_goals(status);
CREATE INDEX IF NOT EXISTS idx_profile_goals_target ON profile_goals(target_date);
