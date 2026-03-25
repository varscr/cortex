export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, error } = validateProjectInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO profile_projects (name, description, url, repo_url, tech_stack, image_url, is_featured, type, role_type, status, highlights, client)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [data.name, data.description, data.url, data.repoUrl, data.techStack, data.imageUrl, data.isFeatured, data.type, data.roleType, data.status, data.highlights, data.client],
  )

  setResponseStatus(event, 201)
  return toProject(result.rows[0])
})
