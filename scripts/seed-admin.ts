import { db } from '../server/utils/db'
// @ts-ignore
import { hashPassword } from 'better-auth/crypto'

async function seed() {
  const [email, password, name] = process.argv.slice(2)
  if (!email || !password) {
    console.log('Usage: bun run scripts/seed-admin.ts <email> <password> [name]')
    process.exit(1)
  }

  console.log(`[seed] Seeding admin user: ${email}...`)
  
  try {
    const hash = await hashPassword(password)
    
    // 1. Check if user exists
    const userRes = await db.query('SELECT id FROM "user" WHERE email = $1', [email])
    let userId: string

    if (userRes.rows.length === 0) {
      // 2. Create User (camelCase columns for better-auth)
      const newUser = await db.query(
        'INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [crypto.randomUUID(), email, name || 'Admin', true]
      )
      userId = newUser.rows[0].id
      console.log('User created.')
    } else {
      userId = userRes.rows[0].id
      console.log('User already exists.')
    }

    // 3. Create or Update Account
    const accountRes = await db.query('SELECT id FROM "account" WHERE "userId" = $1', [userId])
    if (accountRes.rows.length === 0) {
      await db.query(
        'INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [crypto.randomUUID(), userId, email, 'email', hash]
      )
      console.log('Account created.')
    } else {
      await db.query('UPDATE "account" SET password = $1, "updatedAt" = NOW() WHERE "userId" = $2', [hash, userId])
      console.log('Password updated.')
    }

    console.log('Successfully seeded admin user!')
  } catch (err: any) {
    console.error('Failed to seed admin:', err)
  } finally {
    process.exit(0)
  }
}

seed()
