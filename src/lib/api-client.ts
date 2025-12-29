import { hc } from 'hono/client'
import type todosRoute from '../routes/todos'

// Hono RPCクライアントの型を推論
type TodosClient = typeof todosRoute

// APIクライアントを作成
export const apiClient = {
  todos: hc<TodosClient>('/api/todos'),
}

export type ApiClient = typeof apiClient
