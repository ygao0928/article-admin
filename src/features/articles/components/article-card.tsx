import { useState } from 'react'
import {
  Copy,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useImageMode } from '@/context/image-mode-provider.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ResponsiveModal } from '@/components/response-modal.tsx'
import { DownloaderDialog } from './downloader-dialog'
import type { Article } from '@/api/article.ts'

export function ArticleCard({ article }: { article: Article }) {
  const { mode } = useImageMode()
  const images = article.preview_images.split(',').filter(Boolean)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const handleCopyMagnet = async () => {
    try {
      await navigator.clipboard.writeText(article.magnet)
      toast.success('磁力链接已复制')
    } catch (err) {
      toast.error(`复制失败:${err}`)
    }
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <Card className='group glass-card relative flex w-full max-w-full flex-col gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-300 sm:flex-row'>
      {/* 顶部渐变装饰 */}
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      {/* 图片预览 */}
      <ResponsiveModal
        title='图片预览'
        trigger={
          mode !== 'hide' && (
            <div className='relative h-48 w-full cursor-pointer overflow-hidden rounded-xl sm:h-32 sm:w-48 sm:flex-shrink-0'>
              {!imageError && images.length > 0 ? (
                <>
                  <img
                    src={images[0]}
                    alt={article.title}
                    className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                      mode === 'blur' ? 'blur-md' : ''
                    }`}
                    onError={() => setImageError(true)}
                  />

                  {/* 图片数量提示 */}
                  {images.length > 1 && (
                    <div className='absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm'>
                      <ImageIcon className='h-3 w-3' />
                      {images.length}
                    </div>
                  )}

                  {/* 放大图标 */}
                  <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <div className='rounded-full bg-white/20 p-3 backdrop-blur-sm'>
                      <ImageIcon className='h-6 w-6 text-white' />
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-muted'>
                  <ImageIcon className='h-12 w-12 text-muted-foreground/30' />
                </div>
              )}
            </div>
          )
        }
      >
        <div className='relative rounded-lg bg-black/95 p-4'>
          <img
            src={images[currentIndex]}
            alt={`${article.title}-${currentIndex}`}
            className='max-h-[80vh] max-w-[90vw] rounded-lg object-contain'
          />

          {/* 图片导航 */}
          {images.length > 1 && (
            <>
              <Button
                size='icon'
                variant='ghost'
                onClick={prevImage}
                className='absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white'
              >
                <ChevronLeft className='h-6 w-6' />
              </Button>

              <Button
                size='icon'
                variant='ghost'
                onClick={nextImage}
                className='absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white'
              >
                <ChevronRight className='h-6 w-6' />
              </Button>

              {/* 图片计数 */}
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm'>
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* 缩略图 */}
          {images.length > 1 && (
            <div className='mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin'>
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    currentIndex === index
                      ? 'scale-110 border-primary shadow-lg'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`preview-${index}`}
                    className='h-full w-full object-cover'
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </ResponsiveModal>

      {/* 内容区 */}
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        {/* 标签和日期 */}
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <Badge variant='secondary' className='shadow-sm'>
            {article.section}
          </Badge>

          {article.category && (
            <Badge variant='outline' className='shadow-sm'>
              {article.category}
            </Badge>
          )}

          <span className='flex items-center gap-1 text-muted-foreground'>
            <CalendarIcon className='h-3 w-3' />
            {article.publish_date}
          </span>
        </div>

        {/* 标题 */}
        <h6 className='line-clamp-2 break-words text-base font-semibold leading-snug transition-colors group-hover:text-primary sm:text-sm'>
          {article.title}
        </h6>

        {/* 底部信息 */}
        <div className='mt-auto flex flex-wrap items-center gap-2 text-xs'>
          {/* 文件大小 */}
          {article.size && (
            <span className='flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium'>
              <Package className='h-3 w-3' />
              {article.size} MB
            </span>
          )}

          {/* 下载状态 */}
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${
              article.in_stock
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}
          >
            {article.in_stock ? (
              <>
                <CheckCircle2 className='h-3 w-3' />
                已下载
              </>
            ) : (
              <>
                <Clock className='h-3 w-3' />
                未下载
              </>
            )}
          </span>

          {/* 查看详情链接 */}
          {article.detail_url && (
            <a
              href={article.detail_url}
              target='_blank'
              rel='noopener noreferrer'
              className='ml-auto flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary'
            >
              <ExternalLink className='h-3 w-3' />
              <span className='text-xs'>详情</span>
            </a>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='flex w-full gap-2 sm:w-auto sm:flex-col sm:justify-center'>
        <Button
          size='sm'
          variant='default'
          className='flex-1 gap-2 shadow-md transition-all hover:shadow-lg sm:w-28 sm:flex-none'
          onClick={handleCopyMagnet}
        >
          <Copy className='h-4 w-4' />
          <span>复制</span>
        </Button>

        <DownloaderDialog
          articleId={article.tid}
          trigger={
            <Button
              size='sm'
              variant='outline'
              className='flex-1 gap-2 shadow-md transition-all hover:shadow-lg sm:w-28 sm:flex-none'
            >
              <Download className='h-4 w-4' />
              <span>下载</span>
            </Button>
          }
        />
      </div>
    </Card>
  )
}