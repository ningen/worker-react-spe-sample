/** @jsxImportSource react */
import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useState } from 'react'
import { signIn } from '../lib/auth-client'
import { loginSchema } from '../lib/schemas'

export function LoginForm() {
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
          window.location.href = '/todos'
        }
      } catch (err) {
        setError('ログインに失敗しました')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>ログイン</h2>
      <form id={form.id} onSubmit={form.onSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor={fields.email.id} style={{ display: 'block', marginBottom: '5px' }}>
            メールアドレス
          </label>
          <input
            id={fields.email.id}
            name={fields.email.name}
            type="email"
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          {fields.email.errors && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {fields.email.errors}
            </div>
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor={fields.password.id} style={{ display: 'block', marginBottom: '5px' }}>
            パスワード
          </label>
          <input
            id={fields.password.id}
            name={fields.password.name}
            type="password"
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          {fields.password.errors && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {fields.password.errors}
            </div>
          )}
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/register" style={{ color: '#007bff' }}>
          アカウントを作成
        </a>
      </div>
    </div>
  )
}
