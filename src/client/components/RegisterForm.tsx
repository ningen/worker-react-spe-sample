/** @jsxImportSource react */
import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useState } from 'react'
import { signUp } from '../../shared/lib/auth-client'
import { registerSchema } from '../../shared/schemas'

export function RegisterForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema })
    },
    async onSubmit(event, { formData }) {
      event.preventDefault()
      setError('')
      setLoading(true)

      const submission = parseWithZod(formData, { schema: registerSchema })

      if (submission.status !== 'success') {
        setLoading(false)
        return
      }

      try {
        const { confirmPassword, ...data } = submission.value
        const result = await signUp.email(data)

        if (result.error) {
          setError(result.error.message || '登録に失敗しました')
        } else {
          window.location.href = '/todos'
        }
      } catch (err) {
        setError('登録に失敗しました')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">アカウント作成</h2>
      <form id={form.id} onSubmit={form.onSubmit}>
        <div className="mb-4">
          <label htmlFor={fields.name.id} className="block mb-2 text-sm font-medium text-gray-700">
            名前
          </label>
          <input
            id={fields.name.id}
            name={fields.name.name}
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {fields.name.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.name.errors}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor={fields.email.id} className="block mb-2 text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id={fields.email.id}
            name={fields.email.name}
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {fields.password.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.password.errors}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor={fields.confirmPassword.id} className="block mb-2 text-sm font-medium text-gray-700">
            パスワード（確認）
          </label>
          <input
            id={fields.confirmPassword.id}
            name={fields.confirmPassword.name}
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {fields.confirmPassword.errors && (
            <div className="text-red-600 text-xs mt-1">
              {fields.confirmPassword.errors}
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
          className="w-full py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
      <div className="mt-5 text-center">
        <a href="/login" className="text-blue-600 hover:text-blue-800">
          すでにアカウントをお持ちの方
        </a>
      </div>
    </div>
  )
}
