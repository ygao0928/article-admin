import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileQuestion, RefreshCw, Search } from 'lucide-react'
import { getArticles, getCategories } from '@/api/article.ts'
import { useSearch } from '@/context/search-provider.tsx'
import { useDebounce } from '@/hooks/use-debounce.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CommonPagination } from '@/components/pagination.tsx'
import { ArticleCard } from '@/features/articles/components/article-card.tsx'
import { FilterBar } from '@/features/articles/components/filter-bar.tsx'

export function ArticlesDesktop() {
  const { keyword } = useSearch()
  const debouncedKeyword = useDebounce(keyword, 300)
  const [filter, setFilter] = useState({
    page: 1,
    page_size: 30,
    keyword: '',
    section: '',
  })

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

      {/* ② 表格区域（滚动容器） */}
      <div className='flex-1 overflow-auto'>
        {isLoading && (
          <div className='flex h-full items-center justify-center'>
            <div className='flex flex-col items-center gap-3 text-muted-foreground'>
              <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm'>加载中...</p>
            </div>
          </div>
        )}
        {(!data?.items || data.items.length === 0) && (
          <div className='flex h-full items-center justify-center p-8'>
            <div className='flex max-w-md flex-col items-center gap-4 text-center'>
              <div className='relative'>
                <FileQuestion className='h-20 w-20 text-muted-foreground/20' />
                <Search className='absolute -right-1 -bottom-1 h-8 w-8 text-muted-foreground/30' />
              </div>

              <div className='space-y-2'>
                <h3 className='text-lg font-semibold text-foreground'>
                  暂无数据
                </h3>
                <p className='text-sm text-muted-foreground'>
                  没有找到符合条件的文章，试试调整筛选条件或搜索关键词
                </p>
              </div>

              <Button
                onClick={() => setFilter((prev) => ({ ...prev, keyword: '' }))}
                variant='outline'
                className='gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                重置筛选
              </Button>
            </div>
          </div>
        )}
        <div className='grid gap-2'>
          {data?.items.map((article) => (
            <ArticleCard key={article.tid} article={article} />
          ))}
        </div>
      </div>

      {/* ④ 分页 */}
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
