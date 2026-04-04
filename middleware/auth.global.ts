export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const auth = useAuth()
  const { data: session } = await auth.getSession({
    fetchOptions: {
      headers: useRequestHeaders(['cookie'])
    }
  })

  if (!session) {
    return navigateTo('/login')
  }
})
