/** @jsxImportSource react */
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { TodoList } from './components/TodoList'

export function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  if (path === '/login') {
    return <LoginForm />
  }

  if (path === '/register') {
    return <RegisterForm />
  }

  if (path === '/todos') {
    return <TodoList />
  }

  return (
    <div className="text-center mt-24">
      <h1 className="text-3xl font-bold mb-4">TodoListアプリケーション</h1>
      <p className="text-gray-600 mb-8">better-auth + Drizzle ORM + Cloudflare Workers</p>
      <div className="space-x-4">
        <a
          href="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ログイン
        </a>
        <a
          href="/register"
          className="inline-block px-5 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          アカウント作成
        </a>
      </div>
    </div>
  )
}
