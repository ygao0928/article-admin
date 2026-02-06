import { useState } from 'react'
import {
  Copy,
  Image as ImageIcon,
  Package,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Article } from '@/api/article.ts'
import { useImageMode } from '@/context/image-mode-provider.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DownloaderButton } from './downloader-button.tsx'

export function ArticleCard({
  article,
  onImgClick,
}: {
  article: Article
  onImgClick?: () => void
}) {
  const { mode } = useImageMode()
  const images = (article.img_list ?? '').split(',').filter(Boolean)
  const [imageError, setImageError] = useState(false)

  const copyTextFallback = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text

    // 防止页面跳动
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  }

  const handleCopyMagnet = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(article.magnet)
      } else {
        const ok = copyTextFallback(article.magnet)
        if (!ok) throw new Error('execCommand failed')
      }
      toast.success('磁力链接已复制')
    } catch (err) {
      toast.error(`复制失败:${err}`)
    }
  }

  return (
    <Card className='group glass-card relative flex w-full max-w-full flex-col overflow-hidden rounded-2xl  transition-all duration-300 py-0'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-pink-400 via-sky-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      {/* 图片预览 */}
      {images.length > 0 && mode !== 'hide' && (
        <div className='relative w-full aspect-[16/9] cursor-pointer overflow-hidden rounded-xl' onClick={onImgClick}>
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

              {images.length > 1 && (
                <div className='absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm'>
                  <ImageIcon className='h-3 w-3' />
                  {images.length}
                </div>
              )}

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
      )}

      {/* 内容区 */}
      <div className='flex min-w-0 flex-1 flex-col gap-3 p-2'>
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <Badge variant='default' className='shadow-sm'>
            {article.website}
          </Badge>
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

        <h6 className='line-clamp-3 text-base leading-snug font-semibold break-words transition-colors group-hover:text-primary sm:text-sm'>
          {article.title}
        </h6>

        <div className='mt-auto flex flex-wrap items-center gap-2 text-xs'>
          {article.size > 0 && (
            <span className='flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium'>
              <Package className='h-3 w-3' />
              {article.size} MB
            </span>
          )}

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
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button size='sm' className='gap-2 w-full' onClick={handleCopyMagnet} >
            <Copy className='h-4 w-4' />
            复制
          </Button>

          <DownloaderButton articleIdList={[article.tid]} />
        </div>
      </div>
    </Card>
  )
}
