import type z from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import type { Category } from '@/types/article.ts'
import { ChevronDown, Trash2, Regex } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import type { DownloaderConfig } from '@/features/settings/folder/folder-form.tsx'
import type { folderFormSchema } from '@/features/settings/folder/schema.ts'

interface Props {
  index: number
  form: UseFormReturn<z.infer<typeof folderFormSchema>>
  categories: Category[]
  downloaders: DownloaderConfig[]
  remove: (index: number) => void
}

export function FolderItem({
  index,
  form,
  categories,
  downloaders,
  remove,
}: Props) {
  const category = form.watch(`folders.${index}.category`)
  const subCategory = form.watch(`folders.${index}.subCategory`)
  const regex = form.watch(`folders.${index}.regex`)
  const downloader = form.watch(`folders.${index}.downloader`)
  const savePath = form.watch(`folders.${index}.savePath`)

  const subCategories =
    categories?.find((c) => c.category === category)?.items ?? []

  const savePaths =
    downloaders.find((d) => d.id === downloader)?.save_paths ?? []

  return (
    <Collapsible className='group overflow-hidden rounded-xl border bg-card'>
      <CollapsibleTrigger asChild>
        <div className='flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-muted/50'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary'>
              {index + 1}
            </div>
            <Badge variant='secondary'>
              {category || '未选择类目'} · {subCategory || '未选择子类目'} ·{regex || ''}
            </Badge>
            {savePath && (
              <div className='truncate text-xs text-muted-foreground'>
                {downloader} - {savePath}
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <ChevronDown className='h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
            <Button
              size='icon'
              variant='ghost'
              className='text-destructive'
              onClick={(e) => {
                e.stopPropagation()
                remove(index)
              }}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className='border-t bg-muted/20'>
        <div className='grid gap-5 p-5 sm:grid-cols-2'>
          {/* category */}
          <FormField
            control={form.control}
            name={`folders.${index}.category`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>规则板块</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue(`folders.${index}.subCategory`, '')
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder='选择板块' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    <SelectItem value='ALL'>不限制板块</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c.category} value={c.category}>
                        {c.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* subCategory */}
          <FormField
            control={form.control}
            name={`folders.${index}.subCategory`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>具体分类</FormLabel>
                <Select
                  value={field.value}
                  disabled={!category}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder='选择分类' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    <SelectItem value='ALL'>不限制类目</SelectItem>
                    {subCategories.map((s) => (
                      <SelectItem key={s.category} value={s.category}>
                        {s.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* regex */}
          <FormField
            control={form.control}
            name={`folders.${index}.regex`}
            render={({ field }) => (
              <FormItem className='col-span-full'>
                <FormLabel className='flex items-center gap-2'>
                  <Regex className='h-4 w-4' />
                  匹配正则（可选）
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='^[A-Z]{3,5}-\\d{3,4}$'
                    className='font-mono'
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* downloader */}
          <FormField
            control={form.control}
            name={`folders.${index}.downloader`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>下载器</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue(`folders.${index}.savePath`, '')
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder='选择下载器' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {downloaders.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* savePath */}
          <FormField
            control={form.control}
            name={`folders.${index}.savePath`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>存储路径</FormLabel>
                <Select
                  value={field.value}
                  disabled={!downloader}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder='选择路径' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
