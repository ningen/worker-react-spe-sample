import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import * as schema from '../db/schema'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 全てのTodoを取得
app.get('/', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = drizzle(c.env.DB, { schema })
  const todos = await db.select().from(schema.todo).where(eq(schema.todo.userId, user.id))

  return c.json({ todos })
})

// 新しいTodoを作成
app.post('/', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { title, description } = await c.req.json()

  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }

  const db = drizzle(c.env.DB, { schema })
  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(schema.todo).values({
    id,
    title,
    description: description || null,
    completed: false,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  })

  const [newTodo] = await db.select().from(schema.todo).where(eq(schema.todo.id, id))

  return c.json({ todo: newTodo }, 201)
})

// Todoを更新
app.put('/:id', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const id = c.req.param('id')
  const { title, description, completed } = await c.req.json()

  const db = drizzle(c.env.DB, { schema })

  // Todoが存在し、ユーザーが所有しているか確認
  const [existingTodo] = await db
    .select()
    .from(schema.todo)
    .where(and(eq(schema.todo.id, id), eq(schema.todo.userId, user.id)))

  if (!existingTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  const now = new Date()
  await db
    .update(schema.todo)
    .set({
      title: title ?? existingTodo.title,
      description: description !== undefined ? description : existingTodo.description,
      completed: completed ?? existingTodo.completed,
      updatedAt: now,
    })
    .where(eq(schema.todo.id, id))

  const [updatedTodo] = await db.select().from(schema.todo).where(eq(schema.todo.id, id))

  return c.json({ todo: updatedTodo })
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
  const [existingTodo] = await db
    .select()
    .from(schema.todo)
    .where(and(eq(schema.todo.id, id), eq(schema.todo.userId, user.id)))

  if (!existingTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  await db.delete(schema.todo).where(eq(schema.todo.id, id))

  return c.json({ success: true })
})

export default app
