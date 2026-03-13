import pg from 'pg'

// Parse DATE (1082) and TIMESTAMPTZ (1184) as strings instead of JS Date objects
pg.types.setTypeParser(1082, (val: string) => val)
pg.types.setTypeParser(1184, (val: string) => val)

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = pool
