import { toNote } from '~/server/utils/notes/transform'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = event.context.user

  const result = await db.query(
    'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
    [id, user.id]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  }

  return toNote(result.rows[0])
})
