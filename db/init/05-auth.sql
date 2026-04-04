-- Better Auth core tables (camelCase columns required by Better Auth)

DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ,
    "refreshTokenExpiresAt" TIMESTAMPTZ,
    scope TEXT,
    "idToken" TEXT,
    password TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id to all top-level tables (nullable for now, will be NOT NULL after data migration)

ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE kanban_boards ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_education ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_goals ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_links ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_skills ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_certifications ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE profile_references ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE knowledge_entries ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);
ALTER TABLE finance_accounts ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);

-- Indexes on user_id

CREATE INDEX IF NOT EXISTS idx_log_entries_user ON log_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_boards_user ON kanban_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_about_user ON profile_about(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_education_user ON profile_education(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_experience_user ON profile_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_goals_user ON profile_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_user ON profile_links(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_projects_user ON profile_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_user ON profile_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_certifications_user ON profile_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_references_user ON profile_references(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_user ON knowledge_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_user ON finance_accounts(user_id);
