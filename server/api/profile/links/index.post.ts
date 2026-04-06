export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateLinkInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_links (user_id, label, url, icon, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user.id, data.label, data.url, data.icon, data.position],
  )

  setResponseStatus(event, 201)
  return toLink(result.rows[0])
})
