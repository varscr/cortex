import { unlink } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  const result = await db.query(
    `SELECT s.file_path 
     FROM finance_statements s 
     JOIN finance_accounts a ON a.id = s.account_id 
     WHERE s.id = $1 AND a.user_id = $2`,
    [id, user.id],
  )
  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Statement not found' })
  }

  // Delete PDF file from disk
  try {
    await unlink(result.rows[0].file_path)
  } catch {
    // File may already be deleted, continue
  }

  await db.query(
    `DELETE FROM finance_statements s
     USING finance_accounts a
     WHERE s.id = $1 AND s.account_id = a.id AND a.user_id = $2`,
    [id, user.id],
  )

  return { deleted: true }
})
