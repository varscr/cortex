export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateReferenceInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_references (name, title, contact, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.title, data.contact, data.notes],
  )

  setResponseStatus(event, 201)
  return toReference(result.rows[0])
})
