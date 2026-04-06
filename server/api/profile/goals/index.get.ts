export default defineEventHandler(async (event) => {
  const user = event.context.user
  const result = await db.query(
    `SELECT * FROM profile_goals
     WHERE user_id = $1
     ORDER BY
       CASE status
         WHEN 'in_progress' THEN 0
         WHEN 'not_started' THEN 1
         WHEN 'completed' THEN 2
       END,
       target_date ASC NULLS LAST`,
    [user.id],
  )

  return result.rows.map(toGoal)
})
