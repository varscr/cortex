export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (path.startsWith('/api/auth/')) return
  if (!path.startsWith('/api/')) return

  const user = await requireUser(event)
  event.context.user = user
})
