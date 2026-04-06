import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is missing')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: DATABASE_URL })

const USER_ID = 'TdhGnbDCrKZSXxzg6MgVnqsqztS0innf'

const tables = [
  'log_entries',
  'kanban_boards',
  'documents',
  'profile_about',
  'profile_education',
  'profile_experience',
  'profile_goals',
  'profile_links',
  'profile_projects',
  'profile_skills',
  'profile_certifications',
  'profile_references',
  'knowledge_entries',
  'agent_runs',
  'chat_sessions',
  'finance_accounts'
]

async function run() {
  try {
    await pool.query('BEGIN')
    
    for (const table of tables) {
      console.log(`Updating table: ${table}...`)
      const updateRes = await pool.query(`UPDATE ${table} SET user_id = $1 WHERE user_id IS NULL`, [USER_ID])
      console.log(`  -> Updated ${updateRes.rowCount} rows.`)
      
      console.log(`  -> Altering column to NOT NULL...`)
      await pool.query(`ALTER TABLE ${table} ALTER COLUMN user_id SET NOT NULL`)
    }
    
    await pool.query('COMMIT')
    console.log('Migration completed successfully.')
  } catch (err: any) {
    await pool.query('ROLLBACK')
    console.error('Migration failed:', err.message)
  } finally {
    await pool.end()
  }
}

run()
