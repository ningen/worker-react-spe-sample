/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { renderer } from './renderer'
import { createAuth } from '../shared/lib/auth'
import type { Bindings, Variables } from '../shared/types'
import todosRoute from './routes/todos'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  // better-authインスタンスを初期化
  .use('*', async (c, next) => {
    const auth = createAuth(c.env.DB)
    c.set('auth', auth)
    await next()
  })
  // 認証APIエンドポイント
  .on(['POST', 'GET'], '/api/auth/**', async (c) => {
    const auth = c.get('auth')
    return auth.handler(c.req.raw)
  })
  // セッションチェックミドルウェア
  .use('/api/todos/*', async (c, next) => {
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
  .route('/api/todos', todosRoute)
  .use(renderer)
  // HTMLレスポンス用のルート
  .get('/', (c) => c.render(<></>))
  .get('/login', (c) => c.render(<></>))
  .get('/register', (c) => c.render(<></>))
  .get('/todos', (c) => c.render(<></>))

export type AppType = typeof app
export default app
