/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { renderer } from './renderer'
import { createAuth } from './lib/auth'
import type { Bindings, Variables } from './types'
import todosRoute from './routes/todos'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// better-authインスタンスを初期化
app.use('*', async (c, next) => {
  const auth = createAuth(c.env.DB)
  c.set('auth', auth)
  await next()
})

// 認証APIエンドポイント
app.on(['POST', 'GET'], '/api/auth/**', async (c) => {
  const auth = c.get('auth')
  return auth.handler(c.req.raw)
})

// セッションチェックミドルウェア
app.use('/api/todos/*', async (c, next) => {
  const auth = c.get('auth')
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  await next()
})

// Todosルート
app.route('/api/todos', todosRoute)

app.use(renderer)

// HTMLレスポンス用のルート
app.get('/', (c) => c.render(<></>))
app.get('/login', (c) => c.render(<></>))
app.get('/register', (c) => c.render(<></>))
app.get('/todos', (c) => c.render(<></>))

export type AppType = typeof app
export default app
