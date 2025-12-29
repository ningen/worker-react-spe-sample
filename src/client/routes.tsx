import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { TodoList } from './components/TodoList'

// ルートレイアウト
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// ホームページルート
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="text-center mt-24">
      <h1 className="text-3xl font-bold mb-4">TodoListアプリケーション</h1>
      <p className="text-gray-600 mb-8">better-auth + Drizzle ORM + Cloudflare Workers</p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ログイン
        </Link>
        <Link
          to="/register"
          className="inline-block px-5 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          アカウント作成
        </Link>
      </div>
    </div>
  ),
})

// ログインルート
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginForm,
})

// 登録ルート
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterForm,
})

// Todoリストルート
const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todos',
  component: TodoList,
})

// ルートツリーを作成
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  todosRoute,
])

// ルーターを作成してエクスポート
export const router = createRouter({ routeTree })

// 型推論のための型定義をエクスポート
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
