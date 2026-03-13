export default defineEventHandler(async (): Promise<LogStats> => {
  const [
    totalResult,
    weekResult,
    monthResult,
    moodResult,
    tagsResult,
    typeResult,
    streakResult,
    weekActivityResult,
  ] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM log_entries`),

    db.query(`SELECT COUNT(*) FROM log_entries WHERE date >= date_trunc('week', CURRENT_DATE)`),

    db.query(`SELECT COUNT(*) FROM log_entries WHERE date >= date_trunc('month', CURRENT_DATE)`),

    db.query(`SELECT mood, COUNT(*)::int AS count FROM log_entries WHERE mood IS NOT NULL GROUP BY mood ORDER BY count DESC`),

    db.query(`SELECT tag, COUNT(*)::int AS count FROM log_entries, unnest(tags) AS tag GROUP BY tag ORDER BY count DESC LIMIT 10`),

    db.query(`SELECT entry_type, COUNT(*)::int AS count FROM log_entries GROUP BY entry_type ORDER BY count DESC`),

    db.query(`
      WITH dates AS (
        SELECT DISTINCT date FROM log_entries ORDER BY date DESC
      ),
      numbered AS (
        SELECT date, date - (ROW_NUMBER() OVER (ORDER BY date DESC))::int AS grp
        FROM dates
      )
      SELECT COUNT(*)::int AS streak
      FROM numbered
      WHERE grp = (
        SELECT grp FROM numbered
        WHERE date >= CURRENT_DATE - 1
        ORDER BY date DESC
        LIMIT 1
      )
    `),

    db.query(`
      SELECT date::text, COUNT(*)::int AS count
      FROM log_entries
      WHERE date >= date_trunc('week', CURRENT_DATE)
      GROUP BY date
      ORDER BY date
    `),
  ])

  return {
    totalEntries: parseInt(totalResult.rows[0].count),
    entriesThisWeek: parseInt(weekResult.rows[0].count),
    entriesThisMonth: parseInt(monthResult.rows[0].count),
    moodDistribution: moodResult.rows.map((r: any) => ({ mood: r.mood, count: r.count })),
    topTags: tagsResult.rows.map((r: any) => ({ tag: r.tag, count: r.count })),
    typeDistribution: typeResult.rows.map((r: any) => ({ entryType: r.entry_type, count: r.count })),
    writingStreak: streakResult.rows[0]?.streak ?? 0,
    currentWeekActivity: weekActivityResult.rows.map((r: any) => ({ date: r.date, count: r.count })),
  }
})
