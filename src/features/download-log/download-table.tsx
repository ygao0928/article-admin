import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { fetchDownloaderList } from '@/api/config.ts'
import { pageDownloadLog } from '@/api/download-log.ts'
import { formatDateTime } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form.tsx'
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

type formValues = {
  downloader: string
  save_path: string
}

export function DownloadLogTable() {
  const form = useForm<formValues>({
    defaultValues: {
      downloader: '',
      save_path: '',
    },
  })
  const [filter, setFilter] = useState({
    downloader: '',
    save_path: '',
    page: 1,
    page_size: 20,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['download-log', filter],
    queryFn: async () => {
      const res = await pageDownloadLog(filter)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: downloaders } = useQuery({
    queryKey: ['downloaders'],
    queryFn: async () => {
      const res = await fetchDownloaderList()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const downloader = useWatch({
    control: form.control,
    name: 'downloader',
  })

  const savePaths =
    downloaders?.find((d) => d.id === downloader)?.save_paths ?? []

  const handleFilter = (data: formValues) => {
    setFilter((prev) => ({
      ...prev,
      downloader: data.downloader,
      save_path: data.save_path,
    }))
  }
  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='sticky top-0 z-10 mb-2'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFilter)}
            className='grid grid-cols-2 lg:grid-cols-4 items-end gap-4'
          >
            <FormField
              control={form.control}
              name='downloader'
              render={({ field }) => (
                <FormItem>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='选择下载器' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='w-full'>
                      {downloaders?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='save_path'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!downloader}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='选择路径' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='w-full'>
                      {savePaths.map((p) => (
                        <SelectItem key={p.path} value={p.path}>
                          {p.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className='flex items-center gap-2'>
              <Button type='submit' className='w-[60px]'>
                <Search />
              </Button>
              <Button
                variant='outline'
                className='w-[60px]'
                onClick={() => {
                  form.reset()
                  setFilter({
                    page: 1,
                    page_size: 20,
                    downloader: '',
                    save_path: '',
                  })
                }}
              >
                重置
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className='flex-1 overflow-y-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>tid</TableHead>
              <TableHead>板块</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>预览图</TableHead>
              <TableHead>下载器</TableHead>
              <TableHead>保存路径</TableHead>
              <TableHead>下载时间</TableHead>
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
                <TableRow key={item.id}>
                  <TableCell>{item.tid}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className='max-w-[260px] truncate'>
                    {item.title}
                  </TableCell>
                  <TableCell>{item.size}mb</TableCell>
                  <TableCell>
                    {item.preview_images ? (
                      <img
                        src={item.preview_images.split(',')[0]}
                        alt=''
                        className='h-10 w-16 rounded object-cover'
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{item.downloader}</TableCell>
                  <TableCell className='max-w-[240px] truncate'>
                    {item.save_path}
                  </TableCell>
                  <TableCell>{formatDateTime(item.download_time)}</TableCell>
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
