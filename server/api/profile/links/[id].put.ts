export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateLinkInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_links
     SET label = $1, url = $2, icon = $3, position = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [data.label, data.url, data.icon, data.position, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Link not found' })
  }

  return toLink(result.rows[0])
})
