export default defineEventHandler(async (event) => {
  const { user } = event.context
  const body = await readBody(event)
  const { data, error } = validateReferenceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_references (user_id, name, title, contact, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user.id, data.name, data.title, data.contact, data.notes],
  )

  setResponseStatus(event, 201)
  return toReference(result.rows[0])
})
