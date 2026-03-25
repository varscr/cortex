export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateAboutInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_about (id, headline, bio, location, avatar_url, email, job_title, status, cv_pdf_url, cv_html)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE
     SET headline = $1, bio = $2, location = $3, avatar_url = $4, email = $5, job_title = $6, status = $7, cv_pdf_url = $8, cv_html = $9, updated_at = NOW()
     RETURNING *`,
    [data.headline, data.bio, data.location, data.avatarUrl, data.email, data.jobTitle, data.status, data.cvPdfUrl, data.cvHtml],
  )

  return toAbout(result.rows[0])
})
