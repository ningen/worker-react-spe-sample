# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TodoList application built with Hono, React 19, better-auth, Drizzle ORM, and deployed on Cloudflare Workers with D1 (SQLite) database and KV storage.

**Runtime**: Bun (use `bun` instead of `npm` for all commands)

## Development Commands

### Setup and Installation
```bash
bun install                    # Install dependencies
bun run db:migrate             # Run migrations locally
bun run db:migrate:prod        # Run migrations in production
```

### Development
```bash
bun run dev                    # Start dev server at http://localhost:5173
bun run build                  # Build for production
bun run preview                # Build and preview
bun run deploy                 # Build and deploy to Cloudflare Workers
```

### Database
```bash
bun run db:generate            # Generate migrations from schema changes
bun run cf-typegen             # Generate TypeScript types for Cloudflare bindings
```

## Architecture

### Server-Side Architecture (Hono)

The application uses Hono as the web framework, running on Cloudflare Workers. The entry point is [src/index.tsx](src/index.tsx):

1. **Middleware chain**:
   - Auth instance is created and stored in context for each request
   - Session validation middleware protects `/api/todos/*` routes
   - User object is set in context after successful auth

2. **Route structure**:
   - `/api/auth/**` - Handled by better-auth (`auth.handler`)
   - `/api/todos` - Todo CRUD operations (defined in [src/routes/todos.ts](src/routes/todos.ts))
   - `/`, `/login`, `/register`, `/todos` - HTML routes for SSR

3. **Context types** ([src/types.ts](src/types.ts)):
   - `Bindings`: Cloudflare bindings (DB, KV)
   - `Variables`: Request-scoped data (auth instance, user)

### Client-Side Architecture (React)

Simple client-side routing in [src/app.tsx](src/app.tsx) based on `window.location.pathname`:
- No router library - uses basic path matching
- SSR setup via `vite-ssr-components`
- Entry point: [src/client.tsx](src/client.tsx) hydrates the `#root` element

### Authentication Flow

**better-auth** is initialized per-request (not singleton) in [src/lib/auth.ts](src/lib/auth.ts):
- Uses Drizzle adapter with SQLite (D1)
- Email/password authentication (no email verification)
- Sessions expire after 7 days, updated every 24 hours
- Client uses [src/lib/auth-client.ts](src/lib/auth-client.ts) for `useSession()` and `signOut()`

**Key pattern**: The auth instance is created in middleware and stored in context (`c.set('auth', auth)`), then retrieved in route handlers (`c.get('auth')`).

### Database Schema ([src/db/schema.ts](src/db/schema.ts))

**better-auth tables**: `user`, `session`, `account`, `verification`
**App tables**: `todo` (references `user.id`)

All IDs are UUIDs (text), timestamps use `integer` with `mode: 'timestamp'`, booleans use `integer` with `mode: 'boolean'`.

### Form Validation

Uses **Conform** + **Zod** for progressive enhancement:
- Schemas in [src/lib/schemas.ts](src/lib/schemas.ts)
- `useForm()` hook with `parseWithZod()` for validation
- Server-side validation using `zValidator()` from `@hono/zod-validator`
- See [src/components/TodoList.tsx](src/components/TodoList.tsx) for reference implementation

### API Validation Pattern

Both client and server use the same Zod schemas:
```typescript
// Server (routes/todos.ts)
app.post('/', zValidator('json', createTodoSchema), async (c) => {
  const data = c.req.valid('json')
  // ...
})

// Client (components/TodoList.tsx)
const [form, fields] = useForm({
  onValidate({ formData }) {
    return parseWithZod(formData, { schema: createTodoSchema })
  }
})
```

### Type-Safe API Client ([src/lib/api-client.ts](src/lib/api-client.ts))

Uses Hono's RPC client (`hc`) for end-to-end type safety between routes and client code. Types are inferred from route definitions.

## Important Patterns

### Creating New Database Migrations
1. Modify [src/db/schema.ts](src/db/schema.ts)
2. Run `bun run db:generate` to create migration file in `drizzle/`
3. Run `bun run db:migrate` to apply locally

### Adding New API Routes
1. Create route file in `src/routes/` (see [src/routes/todos.ts](src/routes/todos.ts) as template)
2. Import and mount in [src/index.tsx](src/index.tsx) using `app.route('/api/path', routeHandler)`
3. Add authentication middleware if needed
4. Define Zod schemas in [src/lib/schemas.ts](src/lib/schemas.ts)
5. Use `zValidator` middleware for request validation

### Session-Protected Routes
```typescript
app.use('/api/protected/*', async (c, next) => {
  const auth = c.get('auth')
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  c.set('user', session.user)
  await next()
})
```

### Drizzle ORM Usage
```typescript
const db = drizzle(c.env.DB, { schema })
const results = await db.select().from(schema.todo).where(eq(schema.todo.userId, userId))
```

## Cloudflare Configuration

See [wrangler.jsonc](wrangler.jsonc):
- **Compatibility flags**: `nodejs_compat` (required for better-auth)
- **D1 binding**: `DB` → `todo-app-db`
- **KV binding**: `KV` → `todo-app-kv`

Update bindings in `wrangler.jsonc` and run `bun run cf-typegen` to regenerate types.

## Recent Migration

Recent commits show migration from manual form handling to Conform + Zod validation. When working on forms, use the existing Conform pattern with `useForm()` and `parseWithZod()`.
