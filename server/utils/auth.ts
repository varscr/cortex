import { betterAuth } from 'better-auth'
import { db } from './db'
import type { H3Event } from 'h3'

export const auth = betterAuth({
  database: db,
  baseURL: (process.env.AUTH_URL) + '/api/auth',
  secret: process.env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
})

export async function requireUser(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user
}
