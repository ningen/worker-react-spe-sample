/** @jsxImportSource react */
import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { signIn } from '../../shared/lib/auth-client'
import { loginSchema } from '../../shared/schemas'

export function LoginForm() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema })
    },
    async onSubmit(event, { formData }) {
      event.preventDefault()
      setError('')
      setLoading(true)

      const submission = parseWithZod(formData, { schema: loginSchema })

      if (submission.status !== 'success') {
        setLoading(false)
        return
      }

      try {
        const result = await signIn.email(submission.value)

        if (result.error) {
          setError(result.error.message || 'ログインに失敗しました')
        } else {
          navigate({ to: '/todos' })
        }
      } catch (err) {
        setError('ログインに失敗しました')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>
      <form id={form.id} onSubmit={form.onSubmit}>
        <div className="mb-4">
          <label htmlFor={fields.email.id} className="block mb-2 text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id={fields.email.id}
            name={fields.email.name}
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fields.email.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.email.errors}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor={fields.password.id} className="block mb-2 text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            id={fields.password.id}
            name={fields.password.name}
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fields.password.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.password.errors}
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <div className="mt-5 text-center">
        <Link to="/register" className="text-blue-600 hover:text-blue-800">
          アカウントを作成
        </Link>
      </div>
    </div>
  )
}
