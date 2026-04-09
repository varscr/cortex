import { validateNoteInput } from '~/server/utils/notes/validate'
import { toNote } from '~/server/utils/notes/transform'
import { upsertNoteEmbedding } from '~/server/utils/notes/embed'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user
  const body = await readBody(event)
  const { data, error } = validateNoteInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `UPDATE notes
     SET title = $1, content = $2, type = $3, tags = $4, is_pinned = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [data.title, data.content, data.type, data.tags, data.isPinned, id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  }

  upsertNoteEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for note', result.rows[0].id, err))

  return toNote(result.rows[0])
})
