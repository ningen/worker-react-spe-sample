import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import * as schema from '../db/schema'
import type { Bindings, Variables } from '../types'
import { createTodoSchema, updateTodoSchema } from '../lib/schemas'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 全てのTodoを取得
app.get('/', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = drizzle(c.env.DB, { schema })

  const result = await ResultAsync.fromPromise(
    db.select().from(schema.todo).where(eq(schema.todo.userId, user.id)),
    (error) => new Error(`Failed to fetch todos: ${error}`)
  )

  if (result.isErr()) {
    console.error('Database error:', result.error)
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }

  return c.json(result.value)
})

// 新しいTodoを作成
app.post('/', zValidator('json', createTodoSchema), async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { title, description } = c.req.valid('json')

  const db = drizzle(c.env.DB, { schema })
  const id = crypto.randomUUID()
  const now = new Date()

  const insertResult = await ResultAsync.fromPromise(
    db.insert(schema.todo).values({
      id,
      title,
      description: description || null,
      completed: false,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    }),
    (error) => new Error(`Failed to create todo: ${error}`)
  )

  if (insertResult.isErr()) {
    console.error('Database error:', insertResult.error)
    return c.json({ error: 'Failed to create todo' }, 500)
  }

  const selectResult = await ResultAsync.fromPromise(
    db.select().from(schema.todo).where(eq(schema.todo.id, id)),
    (error) => new Error(`Failed to fetch created todo: ${error}`)
  )

  if (selectResult.isErr()) {
    console.error('Database error:', selectResult.error)
    return c.json({ error: 'Todo created but failed to fetch' }, 500)
  }

  const [newTodo] = selectResult.value
  if (!newTodo) {
    console.error('Created todo not found')
    return c.json({ error: 'Failed to fetch created todo' }, 500)
  }

  return c.json(newTodo, 201)
})

// Todoを更新
app.put('/:id', zValidator('json', updateTodoSchema), async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const id = c.req.param('id')
  const { title, description, completed } = c.req.valid('json')

  const db = drizzle(c.env.DB, { schema })

  // Todoが存在し、ユーザーが所有しているか確認
  const checkResult = await ResultAsync.fromPromise(
    db
      .select()
      .from(schema.todo)
      .where(and(eq(schema.todo.id, id), eq(schema.todo.userId, user.id))),
    (error) => new Error(`Failed to check todo: ${error}`)
  )

  if (checkResult.isErr()) {
    console.error('Database error:', checkResult.error)
    return c.json({ error: 'Failed to check todo' }, 500)
  }

  const [existingTodo] = checkResult.value
  if (!existingTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  const now = new Date()
  const updateResult = await ResultAsync.fromPromise(
    db
      .update(schema.todo)
      .set({
        title: title ?? existingTodo.title,
        description: description !== undefined ? description : existingTodo.description,
        completed: completed ?? existingTodo.completed,
        updatedAt: now,
      })
      .where(eq(schema.todo.id, id)),
    (error) => new Error(`Failed to update todo: ${error}`)
  )

  if (updateResult.isErr()) {
    console.error('Database error:', updateResult.error)
    return c.json({ error: 'Failed to update todo' }, 500)
  }

  const selectResult = await ResultAsync.fromPromise(
    db.select().from(schema.todo).where(eq(schema.todo.id, id)),
    (error) => new Error(`Failed to fetch updated todo: ${error}`)
  )

  if (selectResult.isErr()) {
    console.error('Database error:', selectResult.error)
    return c.json({ error: 'Todo updated but failed to fetch' }, 500)
  }

  const [updatedTodo] = selectResult.value
  if (!updatedTodo) {
    console.error('Updated todo not found')
    return c.json({ error: 'Failed to fetch updated todo' }, 500)
  }

  return c.json(updatedTodo)
})

// Todoを削除
app.delete('/:id', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const id = c.req.param('id')
  const db = drizzle(c.env.DB, { schema })

  // Todoが存在し、ユーザーが所有しているか確認
  const checkResult = await ResultAsync.fromPromise(
    db
      .select()
      .from(schema.todo)
      .where(and(eq(schema.todo.id, id), eq(schema.todo.userId, user.id))),
    (error) => new Error(`Failed to check todo: ${error}`)
  )

  if (checkResult.isErr()) {
    console.error('Database error:', checkResult.error)
    return c.json({ error: 'Failed to check todo' }, 500)
  }

  const [existingTodo] = checkResult.value
  if (!existingTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  const deleteResult = await ResultAsync.fromPromise(
    db.delete(schema.todo).where(eq(schema.todo.id, id)),
    (error) => new Error(`Failed to delete todo: ${error}`)
  )

  if (deleteResult.isErr()) {
    console.error('Database error:', deleteResult.error)
    return c.json({ error: 'Failed to delete todo' }, 500)
  }

  return c.json({ success: true })
})

export default app
