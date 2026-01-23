import { request } from '@/api/request.ts'

export interface TaskFunc {
  func_name: string
  func_label: string
  func_args: string[]
}

export interface Task {
  id: number
  task_name: string
  task_func: string
  task_args: string
  task_cron: string
  enable: boolean
}

export interface TaskLogFilter {
  page: number
  pageSize: number
  task_func: string
}
export interface TaskLog {
  id: number
  task_name: string
  task_func: string
  start_time: string
  end_time: string
  execute_seconds: number
  execute_result: string
  execute_flag: string
  success: boolean
  error: string
  create_time: string
}
export interface TaskLogResult {
  total: number
  items: TaskLog[]
}

export function getTasks() {
  return request<Task[]>({ url: '/tasks/' })
}


export function fetchFuncList() {
  return request<TaskFunc[]>({ url: '/tasks/funcs' })
}

export function addTask(task: Task) {
  return request({ url: '/tasks/', method: 'post', data: task })
}

export function updateTask(task: Task) {
  return request({ url: '/tasks/', method: 'put', data: task })
}

export function deleteTask(task_id: number) {
  return request({ url: `/tasks/${task_id}`, method: 'delete' })
}

export function runTask(task_id: number) {
  return request<Task[]>({ url: `/tasks/run/${task_id}`, method: 'get' })
}

export function pageTaskLog(filter: TaskLogFilter) {
  return request<TaskLogResult>({
    url: `/tasks/log/search`,
    method: 'post',
    data: {
      page: filter.page,
      page_size: filter.pageSize,
      task_func: filter.task_func,
    },
  })
}
