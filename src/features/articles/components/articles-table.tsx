import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { getArticles, getCategories } from '@/api/article.ts'
import { formatDate } from '@/lib/utils.ts'
import { useDebounce } from '@/hooks/use-debounce.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { CommonPagination } from '@/components/pagination.tsx'
import { DownloaderButton } from '@/features/articles/components/downloader-button.tsx'

export function ArticlesTable() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [selectTids, setSelectTids] = useState<Set<number>>(new Set())
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [filter, setFilter] = useState({
    page: 1,
    page_size: 50,
    keyword: '',
    website: '',
    section: '',
    category: '',
    date_range: {
      from: '',
      to: '',
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'articles',
      filter,
      dateRange?.from,
      dateRange?.to,
      debouncedKeyword,
    ],
    queryFn: async () => {
      const res = await getArticles({
        ...filter,
        keyword: debouncedKeyword,
        website: filter.website === 'ALL' ? '' : filter.website,
        section: filter.section === 'ALL' ? '' : filter.section,
        category: filter.category === 'ALL' ? '' : filter.category,
        date_range: {
          from: formatDate(dateRange?.from),
          to: formatDate(dateRange?.to),
        },
      })
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const allIds = data?.items.map((item) => item.tid) ?? []

  const isAllChecked =
    allIds.length > 0 && allIds.every((id) => selectTids.has(id))

  const isIndeterminate =
    allIds.some((id) => selectTids.has(id)) && !isAllChecked

  const { data: sections } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const categories = sections?.find(
    (item) => item.name == filter.section
  )?.categories

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='sticky top-0 z-10 mb-2'>
        <Card className='w-full'>
          <CardHeader>过滤筛选</CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Select
              value={filter.website}
              onValueChange={(value) =>
                setFilter({ ...filter, website: value })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='网站' />
              </SelectTrigger>
              <SelectContent className='w-full'>
                <SelectItem value='ALL'>全部网站</SelectItem>
                <SelectItem value='sehuatang'>色花堂</SelectItem>
                <SelectItem value='x1080x'>1080x</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.section}
              onValueChange={(value) =>
                setFilter({ ...filter, section: value })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='板块' />
              </SelectTrigger>
              <SelectContent className='w-full'>
                <SelectItem value='ALL'>不限制板块</SelectItem>
                {sections?.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.category}
              onValueChange={(value) =>
                setFilter({ ...filter, category: value })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='分类' />
              </SelectTrigger>
              <SelectContent className='w-full'>
                <SelectItem value='ALL'>不限制类目</SelectItem>
                {categories?.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Keyword */}
            <Input
              placeholder='关键字'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange?.from
                    ? `${format(dateRange.from, 'yyyy-MM-dd')} ~ ${
                        dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
                      }`
                    : 'Publish Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='range'
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(data) => setDateRange(data)}
                  numberOfMonths={2}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                />
              </PopoverContent>
            </Popover>

            <div className='flex gap-2'>
              <DownloaderButton
                articleIdList={[...selectTids]}
                trigger={<Button variant='destructive'>批量下载</Button>}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex-1 overflow-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    isAllChecked
                      ? true
                      : isIndeterminate
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) => {
                    setSelectTids((prev) => {
                      const next = new Set(prev)
                      if (checked) {
                        allIds.forEach((id) => next.add(id))
                      } else {
                        allIds.forEach((id) => next.delete(id))
                      }
                      return next
                    })
                  }}
                />
              </TableHead>
              <TableHead>tid</TableHead>
              <TableHead>网站</TableHead>
              <TableHead>板块</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>发布日期</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  加载中...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.tid}>
                  <TableCell>
                    <Checkbox
                      checked={selectTids.has(item.tid)}
                      onCheckedChange={(checked) => {
                        setSelectTids((prev) => {
                          const next = new Set(prev)
                          if (checked) {
                            next.add(item.tid)
                          } else {
                            next.delete(item.tid)
                          }
                          return next
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.tid}</TableCell>
                  <TableCell>{item.website}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.size}mb</TableCell>
                  <TableCell>{item.publish_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className='sticky bottom-0 z-10 mt-2'>
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
