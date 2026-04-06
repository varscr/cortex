export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateAboutInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_about (user_id, headline, bio, location, avatar_url, email, job_title, status, cv_pdf_url, cv_html)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (user_id) DO UPDATE
     SET headline = $2, bio = $3, location = $4, avatar_url = $5, email = $6, job_title = $7, status = $8, cv_pdf_url = $9, cv_html = $10, updated_at = NOW()
     RETURNING *`,
    [user.id, data.headline, data.bio, data.location, data.avatarUrl, data.email, data.jobTitle, data.status, data.cvPdfUrl, data.cvHtml],
  )

  upsertAboutEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/about', err))

  return toAbout(result.rows[0])
})
