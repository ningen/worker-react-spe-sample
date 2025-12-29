import type { Auth } from './lib/auth'

export type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export type Variables = {
  auth: Auth
  user: {
    id: string
    email: string
    name: string
  } | null
}
