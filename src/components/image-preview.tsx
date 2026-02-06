import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import 'react-medium-image-zoom/dist/styles.css'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { Button } from '@/components/ui/button.tsx'

export function ImagePreview({
  images,
  alt,
  open,
  onClose,
}: {
  images: string[]
  alt: string
  open: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(0)
    }
  }, [open, images])

  if (!open) return null

  return (
    <div
      title='图片预览'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/90'
      onClick={onClose}
    >
      <Button
        size='icon'
        variant='ghost'
        onClick={onClose}
        className='fixed top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-[60] rounded-full bg-black/60 text-white hover:bg-black/80'
      >
        <X className='h-6 w-6' />
      </Button>
      <div
        className='relative rounded-lg bg-black/95 p-2'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-center'>
          <TransformWrapper
            pinch={{ disabled: false }}
            doubleClick={{ disabled: true }}
          >
            <TransformComponent>
              <img
                src={images[currentIndex]}
                alt={`${alt}-${currentIndex}`}
                className='h-full w-full rounded-lg object-contain'
              />
            </TransformComponent>
          </TransformWrapper>
        </div>

        {images.length > 1 && (
          <>
            <Button
              size='icon'
              variant='ghost'
              onClick={prevImage}
              className='fixed top-1/2 left-4 z-[60] -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80'
            >
              <ChevronLeft className='h-6 w-6' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              onClick={nextImage}
              className='fixed top-1/2 right-4 z-[60] -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80'
            >
              <ChevronRight className='h-6 w-6' />
            </Button>
          </>
        )}

        {/* 缩略图 */}
        {images.length > 1 && (
          <div className='mt-4 flex max-w-[99vw] gap-2 overflow-x-auto pb-2'>
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
    </div>
  )
}
