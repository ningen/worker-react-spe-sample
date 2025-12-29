import { z } from 'zod'

// Todoスキーマ
export const createTodoSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').optional(),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
})

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// 型エクスポート
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type Todo = z.infer<typeof todoSchema>
