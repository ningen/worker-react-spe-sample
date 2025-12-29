/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useSession, signOut } from '../lib/auth-client'

type Todo = {
  id: string
  title: string
  description: string | null
  completed: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export function TodoList() {
  const { data: session, isPending } = useSession()
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchTodos()
    } else if (!isPending && !session) {
      window.location.href = '/login'
    }
  }, [session, isPending])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data.todos || [])
      }
    } catch (err) {
      setError('Todoの取得に失敗しました')
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      if (response.ok) {
        setTitle('')
        setDescription('')
        await fetchTodos()
      } else {
        setError('Todoの追加に失敗しました')
      }
    } catch (err) {
      setError('Todoの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      })

      if (response.ok) {
        await fetchTodos()
      }
    } catch (err) {
      setError('Todoの更新に失敗しました')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('このTodoを削除しますか？')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTodos()
      }
    } catch (err) {
      setError('Todoの削除に失敗しました')
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (isPending) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Todoリスト</h1>
        <div>
          <span style={{ marginRight: '15px' }}>こんにちは、{session.user.name}さん</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ログアウト
          </button>
        </div>
      </div>

      <form onSubmit={handleAddTodo} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>新しいTodoを追加</h3>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
            説明（任意）
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '追加中...' : '追加'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div>
        <h3>あなたのTodo（{todos.length}件）</h3>
        {todos.length === 0 ? (
          <p style={{ color: '#6c757d' }}>Todoがありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      style={{ marginRight: '10px' }}
                    />
                    <h4
                      style={{
                        margin: 0,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#6c757d' : 'inherit',
                      }}
                    >
                      {todo.title}
                    </h4>
                  </div>
                  {todo.description && (
                    <p
                      style={{
                        margin: '5px 0 0 30px',
                        color: '#6c757d',
                        fontSize: '14px',
                      }}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
