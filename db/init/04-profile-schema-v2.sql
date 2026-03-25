-- Profile schema v2 — adds richer fields to existing tables + new certifications/references tables

-- ================================
-- profile_about additions
-- ================================
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS job_title VARCHAR(200);
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS status VARCHAR(200);
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS cv_pdf_url VARCHAR(500);
ALTER TABLE profile_about ADD COLUMN IF NOT EXISTS cv_html TEXT;

-- ================================
-- profile_experience additions
-- ================================
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
ALTER TABLE profile_experience ADD COLUMN IF NOT EXISTS reason_for_leaving TEXT;

-- ================================
-- profile_projects additions
-- ================================
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
ALTER TABLE profile_projects ADD COLUMN IF NOT EXISTS client VARCHAR(200);

-- ================================
-- profile_skills additions
-- ================================
ALTER TABLE profile_skills ADD COLUMN IF NOT EXISTS level VARCHAR(50);
ALTER TABLE profile_skills ADD COLUMN IF NOT EXISTS notes TEXT;

-- ================================
-- profile_certifications (new)
-- ================================
CREATE TABLE IF NOT EXISTS profile_certifications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  institution VARCHAR(200) NOT NULL,
  platform VARCHAR(100),
  date DATE,
  url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- profile_references (new)
-- ================================
CREATE TABLE IF NOT EXISTS profile_references (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200),
  contact VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX IF NOT EXISTS idx_profile_certifications_date ON profile_certifications(date DESC);
