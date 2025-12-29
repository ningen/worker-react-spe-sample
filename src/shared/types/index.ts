import type { Auth } from '../lib/auth'

export type Bindings = CloudflareBindings

export type Variables = {
  auth: Auth
  user?: {
    id: string
    email: string
    name: string
  }
}

// Re-export for convenience
export type { Auth } from '../lib/auth'
