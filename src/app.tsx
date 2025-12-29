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
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>TodoListアプリケーション</h1>
      <p>better-auth + Drizzle ORM + Cloudflare Workers</p>
      <div style={{ marginTop: '30px' }}>
        <a
          href="/login"
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          ログイン
        </a>
        <a
          href="/register"
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          アカウント作成
        </a>
      </div>
    </div>
  )
}
