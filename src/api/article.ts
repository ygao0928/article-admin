import { request } from './request'

export interface Article {
  tid: number
  title: string
  section: string
  publish_date: string
  magnet: string
  img_list: string
  category: string
  size: number
  in_stock: boolean
  detail_url: string
  website: string
}

export interface ArticleFilter {
  page: number
  page_size: number
  keyword: string
  website: string
  section: string
  category: string
  date_range: { from: string; to: string }
}

export interface ArticleListResult {
  items: Article[]
  total: number
  hasMore: boolean
  page: number
  pageSize: number
}

export interface Category {
  name: string
  count: number
}

export interface Section {
  name: string
  count: number
  categories?: Category[]
}

export interface UploadResult {
  inserted: number
  skipped: number
}

export function getArticles(data: ArticleFilter) {
  return request<ArticleListResult>({
    url: '/articles/search',
    method: 'post',
    data,
  })
}

export function getCategories() {
  return request<Section[]>({ url: '/articles/categories' })
}

export function downloadArticle(tid: number) {
  return request({ url: '/articles/download', params: { tid } })
}

export function manulDownloadArticle(
  tid: number,
  downloader: string,
  savePath: string
) {
  return request({
    url: '/articles/download/manul',
    params: { tid, downloader, save_path: savePath },
  })
}

export function batchDownloadArticle(tids: string) {
  return request({ url: '/articles/download/batch', params: { tids } })
}

export function batchManulDownloadArticle(
  tids: string,
  downloader: string,
  savePath: string
) {
  return request({
    url: '/articles/download/manul/batch',
    params: { tids, downloader, save_path: savePath },
  })
}

export function uploadArticle(
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData()
  formData.append('file', file)
  return request<UploadResult>({
    url: '/articles/import/excel',
    method: 'post',
    data: formData,
    onUploadProgress: (e) => {
      if (!e.total) return
      const percent = Math.round((e.loaded / e.total) * 100)
      onProgress?.(percent)
    },
  })
}
