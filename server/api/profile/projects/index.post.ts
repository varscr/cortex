export default defineEventHandler(async (event) => {
  const { user } = event.context
  const body = await readBody(event)
  const { data, error } = validateProjectInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_projects (user_id, name, description, url, repo_url, tech_stack, image_url, is_featured, type, role_type, status, highlights, client)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [user.id, data.name, data.description, data.url, data.repoUrl, data.techStack, data.imageUrl, data.isFeatured, data.type, data.roleType, data.status, data.highlights, data.client],
  )

  upsertProjectEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for profile/project', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toProject(result.rows[0])
})
