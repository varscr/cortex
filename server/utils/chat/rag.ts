export async function buildChatContext(userMessage: string, userId: string): Promise<{
  contextText: string
  sources: ChatSource[]
}> {
  const [searchResults, profile] = await Promise.all([
    searchDocuments(userMessage, userId, { limit: 8 }).catch(() => [] as SearchResult[]),
    db.query('SELECT headline, bio, job_title, status FROM profile_about WHERE user_id = $1 LIMIT 1', [userId]).catch(() => ({ rows: [] })),
  ])

  const sources: ChatSource[] = searchResults.map(r => ({
    source: r.source,
    sourceType: r.sourceType,
    title: (r.metadata?.title as string) ?? r.source,
    similarity: r.similarity,
  }))

  const parts: string[] = []

  if (searchResults.length > 0) {
    const contextLines = searchResults.map(r => {
      const label = `[${r.sourceType}${r.metadata?.section ? ` | ${r.metadata.section}` : r.metadata?.entryType ? ` | ${r.metadata.entryType}` : ''}]`
      const title = (r.metadata?.title as string) ?? ''
      const preview = r.content.slice(0, 300)
      return `${label}${title ? ` ${title}` : ''}\n${preview}`
    })
    parts.push(`## Retrieved Context\n${contextLines.join('\n\n')}`)
  }

  const aboutRow = profile.rows[0]
  if (aboutRow) {
    const profileLines: string[] = []
    if (aboutRow.job_title) profileLines.push(`Job title: ${aboutRow.job_title}`)
    if (aboutRow.headline)  profileLines.push(`Headline: ${aboutRow.headline}`)
    if (aboutRow.status)    profileLines.push(`Status: ${aboutRow.status}`)
    if (aboutRow.bio)       profileLines.push(`Bio: ${aboutRow.bio}`)
    if (profileLines.length > 0) {
      parts.push(`## Your Profile\n${profileLines.join('\n')}`)
    }
  }

  return {
    contextText: parts.join('\n\n'),
    sources,
  }
}
