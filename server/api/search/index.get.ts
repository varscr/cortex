export default defineEventHandler(async (event) => {
  const { q, sourceTypes: rawSourceTypes, limit: rawLimit } = getQuery(event)

  if (!q || !String(q).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'q is required' })
  }

  const sourceTypes = rawSourceTypes
    ? String(rawSourceTypes).split(',').map(s => s.trim()).filter(Boolean)
    : undefined

  const limit = Math.min(parseInt(String(rawLimit ?? '10')) || 10, 100)

  const results = await searchDocuments(String(q).trim(), { sourceTypes, limit })

  return { results, total: results.length, query: q }
})
