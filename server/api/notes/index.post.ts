import { validateNoteInput } from '~/server/utils/notes/validate'
import { toNote } from '~/server/utils/notes/transform'
import { upsertNoteEmbedding } from '~/server/utils/notes/embed'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { data, error } = validateNoteInput(body)

  if (error || !data) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const result = await db.query(
    `INSERT INTO notes (title, content, type, tags, is_pinned, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.title, data.content, data.type, data.tags, data.isPinned, user.id]
  )

  upsertNoteEmbedding(result.rows[0], user.id)
    .catch(err => console.error('[embed] failed for note', result.rows[0].id, err))

  setResponseStatus(event, 201)
  return toNote(result.rows[0])
})
