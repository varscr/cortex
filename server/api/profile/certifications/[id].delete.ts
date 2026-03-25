export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const result = await db.query(
    'DELETE FROM profile_certifications WHERE id = $1 RETURNING id',
    [id],
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Certification not found' })
  }

  deleteCertificationEmbedding(parseInt(id!))
    .catch(err => console.error('[embed] delete failed for profile/certification', id, err))

  return { deleted: true }
})
