import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

export function createAuth(db: D1Database) {
  const drizzleDb = drizzle(db, { schema })

  return betterAuth({
    database: drizzleAdapter(drizzleDb, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7日間
      updateAge: 60 * 60 * 24, // 1日ごとに更新
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
