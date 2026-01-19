import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  ChevronDown,
  FolderCog,
  Save,
  AlertCircle,
  Regex,
} from 'lucide-react'
import { toast } from 'sonner'
import { getCategories } from '@/api/article.ts'
import { getConfig, postConfig } from '@/api/config.ts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DOWNLOADER_META } from '@/features/settings/data/downloader-list.ts'
import { type PathItem } from '@/features/settings/downloader/path-input-list.tsx'

interface Folder {
  category: string
  subCategory: string
  downloader: string
  savePath: string
  regex: string
}

export interface DownloaderConfig {
  id: string
  name: string
  save_paths: PathItem[]
}

export function FolderForm() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await getConfig<Folder[]>('DownloadFolder')
      return res.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (data) setFolders(data)
  }, [data])

  const isValidDownloader = (data: DownloaderConfig) =>
    data &&
    typeof data === 'object' &&
    Array.isArray(data.save_paths) &&
    data.save_paths.length > 0

  const { data: downloaders = [] } = useQuery<DownloaderConfig[]>({
    queryKey: ['downloaders'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        DOWNLOADER_META.map((d) =>
          getConfig<DownloaderConfig>(`Downloader.${d.id}`)
        )
      )
      return results
        .map((res, index) => {
          if (res.status !== 'fulfilled') return null
          const data = res.value?.data ?? {}
          if (isValidDownloader(data)) {
            return {
              id: DOWNLOADER_META[index].id,
              name: DOWNLOADER_META[index].name,
              save_paths: data.save_paths,
            }
          }
          return null
        })
        .filter(Boolean) as DownloaderConfig[]
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['category'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
  })

  const updateFolder = <K extends keyof Folder>(
    index: number,
    key: K,
    value: Folder[K]
  ) => {
    setFolders((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    )
  }

  const handleCategoryChange = (index: number, value: string) => {
    setFolders((prev) =>
      prev.map((cfg, i) =>
        i === index ? { ...cfg, category: value, subCategory: '' } : cfg
      )
    )
  }

  const addFolder = () => {
    setFolders((prev) => [
      ...prev,
      {
        category: '',
        subCategory: '',
        downloader: '',
        savePath: '',
        regex: '',
      },
    ])
  }

  const removeFolder = (index: number) => {
    setFolders((prev) => prev.filter((_, i) => i !== index))
  }

  const getSubCategories = (category: string) => {
    return categories?.find((c) => c.category === category)?.items ?? []
  }

  const getSavePaths = (downloaderId: string): PathItem[] => {
    return downloaders.find((d) => d.id === downloaderId)?.save_paths ?? []
  }

  const handleSaveFolders = async () => {
    setIsSaving(true)
    try {
      const res = await postConfig('DownloadFolder', folders as never)
      toast.success(res.message || '配置已保存')
      await queryClient.invalidateQueries({ queryKey: ['folders'] })
    } catch (error) {
      toast.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading)
    return (
      <div className='py-10 text-center text-sm text-muted-foreground'>
        加载中...
      </div>
    )

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button
          onClick={addFolder}
          variant='outline'
          size='sm'
          className='gap-2'
        >
          <Plus className='h-4 w-4' /> 添加路由
        </Button>
      </div>

      <div className='space-y-4'>
        {folders.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 py-12'>
            <FolderCog className='mb-4 h-10 w-10 text-muted-foreground/50' />
            <p className='text-sm text-muted-foreground'>
              暂无配置，点击上方按钮添加
            </p>
          </div>
        ) : (
          folders.map((cfg, index) => (
            <Collapsible
              key={index}
              className='group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md'
            >
              <CollapsibleTrigger asChild>
                <div className='flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary'>
                      {index + 1}
                    </div>
                    <div className='space-y-1 text-left'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary'>
                          {cfg.category || '未设定'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <ChevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />

                    <Button
                      size='icon'
                      variant='ghost'
                      className='relative z-10 rounded-full text-destructive hover:bg-destructive/10'
                      onClick={(e) => {
                        e.stopPropagation() // 关键：防止触发折叠
                        removeFolder(index)
                      }}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className='border-t bg-muted/20'>
                <div className='grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2'>
                  {/* 板块选择 */}
                  <div className='flex flex-col gap-2'>
                    <Label className='ml-1 text-xs font-semibold text-muted-foreground'>
                      规则板块
                    </Label>
                    <Select
                      value={cfg.category}
                      onValueChange={(v) => handleCategoryChange(index, v)}
                    >
                      <SelectTrigger className='h-11 w-full bg-background shadow-sm transition-all hover:border-primary/50'>
                        <SelectValue placeholder='选择板块' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[300px]'>
                        <SelectItem value='ALL' className='focus:bg-primary/10'>
                          不限制板块
                        </SelectItem>
                        {categories?.map((c) => (
                          <SelectItem key={c.category} value={c.category}>
                            {c.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 分类选择 */}
                  <div className='flex flex-col gap-2'>
                    <Label className='ml-1 text-xs font-semibold text-muted-foreground'>
                      具体分类
                    </Label>
                    <Select
                      value={cfg.subCategory}
                      disabled={!cfg.category}
                      onValueChange={(v) =>
                        updateFolder(index, 'subCategory', v)
                      }
                    >
                      <SelectTrigger className='h-11 w-full bg-background shadow-sm transition-all disabled:opacity-50'>
                        <SelectValue placeholder='选择分类' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[300px]'>
                        <SelectItem value='ALL'>不限制类目</SelectItem>
                        {getSubCategories(cfg.category).map((sub) => (
                          <SelectItem key={sub.category} value={sub.category}>
                            {sub.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-2 col-span-full'>
                    <div className="flex items-center justify-between ml-1">
                      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Regex className="h-3.5 w-3.5" />
                        匹配正则表达式 (可选)
                      </Label>
                      <span className="text-[10px] text-muted-foreground italic">
      匹配示例: ABC-1234
    </span>
                    </div>

                    <div className="relative group">
                      <Input
                        placeholder="示例: ^[A-Z]{3,5}-\d{3,4}$"
                        value={cfg.regex || ''}
                        onChange={(e) => updateFolder(index, 'regex', e.target.value)}
                        className="h-11 bg-background font-mono text-sm pl-9 pr-12 focus-visible:ring-primary shadow-sm border-muted-foreground/20"
                      />
                      {/* 左侧装饰符号 */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 border-r pr-2 font-mono text-sm">
                        /
                      </div>
                      {/* 右侧装饰符号 */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-mono text-xs">
                        /gi
                      </div>
                    </div>

                    <div className="flex gap-4 ml-1 mt-1">
                      <p className="text-[11px] text-muted-foreground/70">
                        <span className="font-semibold text-primary/70">{"^[A-Z]{3,5}"}</span> 匹配3-5位大写字母
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        <span className="font-semibold text-primary/70">{"\\d{3,4}$"}</span> 匹配3-4位数字
                      </p>
                    </div>
                  </div>


                  {/* 下载器选择 */}
                  <div className='flex flex-col gap-2'>
                    <Label className='ml-1 text-xs font-semibold text-muted-foreground'>
                      指定下载器
                    </Label>
                    <Select
                      value={cfg.downloader}
                      onValueChange={(v) => {
                        updateFolder(index, 'downloader', v)
                        updateFolder(index, 'savePath', '')
                      }}
                    >
                      <SelectTrigger className='h-11 w-full bg-background shadow-sm transition-all'>
                        <SelectValue placeholder='选择下载器' />
                      </SelectTrigger>
                      <SelectContent>
                        {downloaders.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Label className='ml-1 text-xs font-semibold text-muted-foreground'>
                      存储路径
                    </Label>
                    <Select
                      value={cfg.savePath}
                      disabled={!cfg.downloader}
                      onValueChange={(v) => updateFolder(index, 'savePath', v)}
                    >
                      <SelectTrigger className='h-11 w-full bg-background shadow-sm transition-all'>
                        <div className='flex-1 truncate text-left'>
                          <SelectValue placeholder='选择保存路径' />
                        </div>
                      </SelectTrigger>
                      <SelectContent className='max-w-[calc(100vw-40px)]'>
                        {getSavePaths(cfg.downloader).map((p) => (
                          <SelectItem
                            key={p.path}
                            value={p.path}
                            className='py-3'
                          >
                            <div className='flex flex-col gap-0.5'>
                              <span className='font-medium'>{p.label}</span>
                              <span className='truncate text-[10px] text-muted-foreground'>
                                {p.path}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>

      <div className='flex items-center justify-between border-t pt-6'>
        <div className='flex items-center gap-2 text-sm text-amber-600'>
          <AlertCircle className='h-4 w-4' />
          <span>修改后请务必点击保存以生效</span>
        </div>
        <Button
          onClick={handleSaveFolders}
          disabled={isSaving}
          className='min-w-[120px] shadow-sm'
        >
          {isSaving ? (
            '保存中...'
          ) : (
            <>
              <Save className='mr-2 h-4 w-4' /> 保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
