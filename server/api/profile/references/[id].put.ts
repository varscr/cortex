export default defineEventHandler(async (event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateReferenceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_references
     SET name = $1, title = $2, contact = $3, notes = $4, updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [data.name, data.title, data.contact, data.notes, id, user.id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Reference not found' })
  }

  return toReference(result.rows[0])
})
