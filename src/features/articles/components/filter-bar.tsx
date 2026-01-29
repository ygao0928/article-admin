import { useEffect, useRef } from 'react'
import type { ArticleFilter, Section } from '@/api/article.ts'
import { Button } from '@/components/ui/button.tsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FilterBarProps {
  value: ArticleFilter
  categories: Section[]
  onChange: (v: ArticleFilter) => void
  onImport?: (file: File) => void
}

export function FilterBar({
  value,
  categories,
  onChange,
  onImport,
}: FilterBarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const tabsListRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!scrollAreaRef.current || !tabsListRef.current) return

    const scrollArea = scrollAreaRef.current
    const tabsList = tabsListRef.current
    const activeTab = tabsList.querySelector(
      '[data-state="active"]'
    ) as HTMLElement

    if (activeTab) {
      const scrollContainer = scrollArea.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement
      if (!scrollContainer) return

      const containerRect = scrollContainer.getBoundingClientRect()
      const activeRect = activeTab.getBoundingClientRect()

      const scrollLeft =
        activeTab.offsetLeft - containerRect.width / 2 + activeRect.width / 2

      scrollContainer.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      })
    }
  }, [value.section])
  return (
    <div className='flex items-center gap-2'>
      <ScrollArea ref={scrollAreaRef} className='mb-2 w-full scrollbar-hide' orientation='horizontal'>
        <Tabs
          value={value.section || 'all'}
          onValueChange={(v) =>
            onChange({ ...value, section: v === 'all' ? '' : v })
          }
        >
          <TabsList  ref={tabsListRef}>
            <TabsTrigger value='all'>全部</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.name} value={c.name}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>
      {onImport && (
        <>
          <Button
            type='button'
            size='sm'
            className='bg-green-600 text-white hover:bg-green-700'
            onClick={() => fileRef.current?.click()}
          >
            注入灵力
          </Button>

          <input
            ref={fileRef}
            type='file'
            hidden
            accept='.xls,.xlsx,.csv'
            onChange={(e) => {
              const file = e.currentTarget.files?.[0]
              if (!file) return
              onImport?.(file)
              e.currentTarget.value = ''
            }}
          />
        </>
      )}
    </div>
  )
}
