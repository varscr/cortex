import { unlink } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'SELECT file_path FROM finance_statements WHERE id = $1',
    [id],
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

  await db.query('DELETE FROM finance_statements WHERE id = $1', [id])

  return { deleted: true }
})
