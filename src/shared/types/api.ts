import type { Hono } from 'hono'
import type { Bindings, Variables } from './index'

// アプリ全体の型
export type AppType = Hono<{ Bindings: Bindings; Variables: Variables }>
