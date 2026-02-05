import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getArticles, getCategories } from '@/api/article.ts'
import { useSearch } from '@/context/search-provider.tsx'
import { useDebounce } from '@/hooks/use-debounce.tsx'
import { EmptyState } from '@/components/empty.tsx'
import { ImagePreview } from '@/components/image-preview.tsx'
import { Loading } from '@/components/loading.tsx'
import { CommonPagination } from '@/components/pagination.tsx'
import { ArticleCard } from '@/features/articles/components/article-card.tsx'
import { FilterBar } from '@/features/articles/components/filter-bar.tsx'

export function ArticlesDesktop() {
  const { keyword } = useSearch()
  const debouncedKeyword = useDebounce(keyword, 300)
  const [filter, setFilter] = useState({
    page: 1,
    page_size: 28,
    keyword: '',
    website: '',
    section: '',
    category: '',
    date_range: {
      from: '',
      to: '',
    },
  })
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [imgPreviewOpen, setImgPreviewOpen] = useState(false)
  const [alt, setAlt] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['articles', filter, debouncedKeyword],
    queryFn: async () => {
      const res = await getArticles({ ...filter, keyword: debouncedKeyword })
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories } = useQuery({
    queryKey: ['category'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* ① 筛选栏 */}
      <div className='sticky top-0 z-30 mb-2'>
        <FilterBar
          value={filter}
          categories={categories || []}
          onChange={(v) => setFilter(v)}
        />
      </div>

      <div className='flex-1 space-y-2 overflow-auto'>
        {isLoading && <Loading />}
        {data?.items.length === 0 && <EmptyState />}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {data?.items.map((article) => (
            <ArticleCard
              key={article.tid}
              article={article}
              onImgClick={() => {
                setPreviewImages(
                  (article.img_list ?? '').split(',').filter(Boolean)
                )
                setAlt(article.title)
                setImgPreviewOpen(true)
              }}
            />
          ))}
        </div>
      </div>
      <ImagePreview
        images={previewImages}
        alt={alt}
        open={imgPreviewOpen}
        onClose={() => {
          setImgPreviewOpen(false)
          setAlt('')
          setPreviewImages([])
        }}
      ></ImagePreview>

      <div className='sticky bottom-0 z-30 mt-2'>
        <CommonPagination
          page={filter.page}
          total={data?.total || 0}
          pageSize={filter.page_size}
          onChange={(v) => setFilter((prev) => ({ ...prev, page: v }))}
        />
      </div>
    </div>
  )
}
