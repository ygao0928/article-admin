import { request } from '@/api/request.ts'
import type { Task } from '@/features/tasks/components/task-manager.tsx'

export function getTasks() {
  return request<Task[]>({ url: '/tasks' })
}

export function addTask(task: Task) {
  return request<Task[]>({ url: '/tasks', method: 'post', data: task })
}

export function updateTask(task: Task) {
  return request<Task[]>({ url: '/tasks', method: 'put', data: task })
}

export function deleteTask(task_id: number) {
  return request<Task[]>({ url: `/tasks/${task_id}`, method: 'DELETE' })
}
