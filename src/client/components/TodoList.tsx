/** @jsxImportSource react */
import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useState, useEffect } from 'react'
import type { InferResponseType } from 'hono/client'
import { useNavigate } from '@tanstack/react-router'
import { useSession, signOut } from '../../shared/lib/auth-client'
import { createTodoSchema } from '../../shared/schemas'
import { api } from '../../shared/lib/api-client'

// Hono RPCからAPIレスポンスの型を推論
type TodoFromAPI = InferResponseType<typeof api.$get, 200>[number]

// Date型に変換したTodo型
type Todo = Omit<TodoFromAPI, 'createdAt' | 'updatedAt'> & {
  createdAt: Date
  updatedAt: Date
}

export function TodoList() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createTodoSchema })
    },
    async onSubmit(event, { formData }) {
      event.preventDefault()
      setError('')
      setLoading(true)

      const submission = parseWithZod(formData, { schema: createTodoSchema })

      if (submission.status !== 'success') {
        setLoading(false)
        return
      }

      try {
        const response = await api.$post({
          json: submission.value,
        })

        if (response.ok) {
          form.reset()
          await fetchTodos()
        } else {
          setError('Todoの追加に失敗しました')
        }
      } catch (err) {
        setError('Todoの追加に失敗しました')
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    if (session?.user) {
      fetchTodos()
    } else if (!isPending && !session) {
      navigate({ to: '/login' })
    }
  }, [session, isPending, navigate])

  const fetchTodos = async () => {
    try {
      const response = await api.$get()
      if (response.ok) {
        const data = await response.json()
        setTodos(
          data.map((todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
          }))
        )
      }
    } catch (err) {
      setError('Todoの取得に失敗しました')
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await api[':id'].$put({
        param: { id: todo.id },
        json: { completed: !todo.completed },
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
      const response = await api[':id'].$delete({
        param: { id },
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
    navigate({ to: '/login' })
  }

  if (isPending) {
    return <div className="text-center mt-12 text-gray-600">読み込み中...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Todoリスト</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">こんにちは、{session.user.name}さん</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      <form id={form.id} onSubmit={form.onSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">新しいTodoを追加</h3>
        <div className="mb-4">
          <label htmlFor={fields.title.id} className="block mb-2 text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            id={fields.title.id}
            name={fields.title.name}
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fields.title.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.title.errors}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor={fields.description.id} className="block mb-2 text-sm font-medium text-gray-700">
            説明（任意）
          </label>
          <textarea
            id={fields.description.id}
            name={fields.description.name}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fields.description.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.description.errors}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '追加中...' : '追加'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">あなたのTodo（{todos.length}件）</h3>
        {todos.length === 0 ? (
          <p className="text-gray-500">Todoがありません</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="p-4 bg-white border border-gray-200 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      className="mr-3 w-4 h-4 cursor-pointer"
                    />
                    <h4
                      className={`text-lg font-medium ${
                        todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h4>
                  </div>
                  {todo.description && (
                    <p className="ml-7 mt-1 text-sm text-gray-600">
                      {todo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
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
