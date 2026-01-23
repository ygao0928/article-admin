import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ArticleFilter, Section } from '@/api/article.ts'

interface FilterBarProps {
  value: ArticleFilter
  categories: Section[]
  onChange: (v: ArticleFilter) => void
}

export function FilterBar({ value, categories, onChange }: FilterBarProps) {
  return (
    <ScrollArea className='mb-2 w-full' type='hover' orientation='horizontal'>
      <Tabs
        value={value.section || 'all'}
        onValueChange={(v) =>
          onChange({ ...value, section: v === 'all' ? '' : v })
        }
      >
        <TabsList>
          <TabsTrigger value='all'>全部</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.name} value={c.name}>
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </ScrollArea>
  )
}
