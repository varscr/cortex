export default defineEventHandler(async () => {
  const result = await db.query(
    `SELECT * FROM profile_goals
     ORDER BY
       CASE status
         WHEN 'in_progress' THEN 0
         WHEN 'not_started' THEN 1
         WHEN 'completed' THEN 2
       END,
       target_date ASC NULLS LAST`,
  )

  return result.rows.map(toGoal)
})
