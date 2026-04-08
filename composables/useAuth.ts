import { createAuthClient } from 'better-auth/vue'

let authClient: any = null

export function useAuth() {
  if (!authClient) {
    const config = useRuntimeConfig()
    const base = process.server ? config.authUrl : config.public.authUrl
    const baseURL = base ? `${base}/api/auth` : '/api/auth'
    authClient = createAuthClient({
      baseURL
    })
  }
  return authClient
}
