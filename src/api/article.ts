import { request } from './request'

export interface Article {
  tid: number
  title: string
  section: string
  publish_date: string
  magnet: string
  preview_images: string
  category: string
  size: number
  in_stock: boolean
  detail_url: string
}

export interface ArticleFilter {
  page: number
  page_size: number
  keyword: string
  section: string
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
