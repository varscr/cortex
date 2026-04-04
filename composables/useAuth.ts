import { createAuthClient } from 'better-auth/vue'

let authClient: any = null

export function useAuth() {
  if (!authClient) {
    const config = useRuntimeConfig()
    const baseURL = config.public.authUrl ? `${config.public.authUrl}/api/auth` : '/api/auth'
    authClient = createAuthClient({
      baseURL
    })
  }
  return authClient
}
