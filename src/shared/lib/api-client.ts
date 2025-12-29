import { hc } from 'hono/client'
import type { AppType } from '../../server/types'

// Hono RPCクライアントを作成
// ルート全体のクライアントを作成し、api.todosでアクセス
export const client = hc<AppType>('/')

// `/api/todos` エンドポイント用のクライアント
export const api = client.api.todos

export type ApiClient = typeof api
