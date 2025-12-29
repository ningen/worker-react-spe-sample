/** @jsxImportSource react */
import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useState } from 'react'
import { signUp } from '../lib/auth-client'
import { registerSchema } from '../lib/schemas'

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>アカウント作成</h2>
      <form id={form.id} onSubmit={form.onSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor={fields.name.id} style={{ display: 'block', marginBottom: '5px' }}>
            名前
          </label>
          <input
            id={fields.name.id}
            name={fields.name.name}
            type="text"
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          {fields.name.errors && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {fields.name.errors}
            </div>
          )}
        </div>
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
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor={fields.confirmPassword.id} style={{ display: 'block', marginBottom: '5px' }}>
            パスワード（確認）
          </label>
          <input
            id={fields.confirmPassword.id}
            name={fields.confirmPassword.name}
            type="password"
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          {fields.confirmPassword.errors && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {fields.confirmPassword.errors}
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
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/login" style={{ color: '#007bff' }}>
          すでにアカウントをお持ちの方
        </a>
      </div>
    </div>
  )
}
