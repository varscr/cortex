export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { data, error } = validateProjectInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE profile_projects
     SET name = $1, description = $2, url = $3, repo_url = $4, tech_stack = $5, image_url = $6, is_featured = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [data.name, data.description, data.url, data.repoUrl, data.techStack, data.imageUrl, data.isFeatured, id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  return toProject(result.rows[0])
})
