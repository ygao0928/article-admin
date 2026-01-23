import { request } from '@/api/request.ts'

export interface DownloadLogFilter {
  page: number
  page_size: number
  downloader: string
  save_path: string
}

export interface DownloadLog {
  id: number
  tid: number
  section: string
  category: string
  title: string
  size: number
  preview_images: string
  downloader: string
  save_path: string
  download_time: string
}

export interface DownloadLogResult {
  total: number
  items: DownloadLog[]
}

export function pageDownloadLog(filter: DownloadLogFilter) {
  return request<DownloadLogResult>({
    url: `/download-log/search`,
    method: 'post',
    data: filter,
  })
}
