export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateAboutInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_about (id, headline, bio, location, avatar_url)
     VALUES (1, $1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
     SET headline = $1, bio = $2, location = $3, avatar_url = $4, updated_at = NOW()
     RETURNING *`,
    [data.headline, data.bio, data.location, data.avatarUrl],
  )

  return toAbout(result.rows[0])
})
