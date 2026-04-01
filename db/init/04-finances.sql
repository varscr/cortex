-- Finance accounts (NU credit card, Bancolombia savings, etc.)
CREATE TABLE IF NOT EXISTS finance_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL,
    institution VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'COP',
    account_number_last4 VARCHAR(4),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded PDF statements
CREATE TABLE IF NOT EXISTS finance_statements (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES finance_accounts(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    period_start DATE,
    period_end DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    run_id INTEGER REFERENCES agent_runs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual transactions parsed from statements
CREATE TABLE IF NOT EXISTS finance_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES finance_accounts(id) ON DELETE CASCADE,
    statement_id INTEGER REFERENCES finance_statements(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    raw_description TEXT NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    type VARCHAR(30) NOT NULL,
    category VARCHAR(50) DEFAULT 'uncategorized',
    running_balance NUMERIC(15,2),
    installment_current INTEGER,
    installment_total INTEGER,
    metadata JSONB DEFAULT '{}',
    content_hash CHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ft_account ON finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_ft_statement ON finance_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_ft_date ON finance_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_ft_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_ft_category ON finance_transactions(category);
CREATE INDEX IF NOT EXISTS idx_fs_account ON finance_statements(account_id);
CREATE INDEX IF NOT EXISTS idx_fs_status ON finance_statements(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ft_content_hash
    ON finance_transactions(content_hash) WHERE content_hash IS NOT NULL;
