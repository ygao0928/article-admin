import { request } from '@/api/request.ts'

export interface Rule {
  id: number
  section: string
  category: string
  regex: string
  downloader: string
  save_path: string
}

export function getRules() {
  return request<Rule[]>({ url: '/rules/' })
}

export function addRule(data: Rule) {
  return request({ url: '/rules/', method: 'post', data })
}

export function updateRule(data: Rule) {
  return request({ url: '/rules/', method: 'put', data })
}

export function deleteRule(rule_id: number) {
  return request({ url: `/rules/${rule_id}`, method: 'delete' })
}
