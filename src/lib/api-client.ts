import { hc } from 'hono/client'

// 型定義を遅延評価で解決するため、動的インポートを使用
// これにより循環参照を回避
type TodosAppType = Awaited<typeof import('../routes/todos')>['TodosAppType']

// Hono RPCクライアントを作成
export const api = hc<TodosAppType>('/api/todos')

export type ApiClient = typeof api
