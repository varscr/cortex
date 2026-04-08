import pg from 'pg'

// Parse DATE (1082) and TIMESTAMPTZ (1184) as strings instead of JS Date objects
pg.types.setTypeParser(1082, (val: string) => val)
pg.types.setTypeParser(1184, (val: string) => val)

const defaultUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/cortex_db`
const connectionString = process.env.DATABASE_URL || defaultUrl

const pool = new pg.Pool({
  connectionString,
})

export const db = pool
