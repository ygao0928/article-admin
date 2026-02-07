import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Regex } from 'lucide-react'
import { toast } from 'sonner'
import { getCategories } from '@/api/article.ts'
import { fetchDownloaderList } from '@/api/config.ts'
import {
  addRule,
  deleteRule,
  getRules,
  type Rule,
  updateRule,
} from '@/api/rule.ts'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { ResponsiveModal } from '@/components/response-modal.tsx'
import { RuleTableDesktop } from '@/features/settings/rule/rule-table-desktop.tsx'
import { RuleTableMobile } from '@/features/settings/rule/rule-table-mobile.tsx'

const formSchema = z.object({
  id: z.number(),
  section: z.string().min(1, '选择板块'),
  category: z.string().min(1, '选择类目'),
  regex: z.string(),
  downloader: z.string().min(1, '选择下载器'),
  save_path: z.string().min(1, '选择保存目录'),
})

type formValues = z.infer<typeof formSchema>

const defaultValues = {
  id: 0,
  section: '',
  category: '',
  regex: '',
  downloader: '',
  save_path: '',
}

export default function RulesManager() {
  const [editRule, setEditRule] = useState<Rule | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const form = useForm<formValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  const { data, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: async () => {
      const res = await getRules()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: sections } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
  const section = useWatch({
    control: form.control,
    name: 'section',
  })

  const categories = sections?.find((item) => item.name == section)?.categories

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

  const savePaths = downloaders?.find(
    (item) => item.id == downloader
  )?.save_paths

  useEffect(() => {
    if (editRule) {
      form.reset(editRule)
    } else if (isFormOpen) {
      form.reset(defaultValues)
    }
  }, [editRule, form, isFormOpen])

  const handleDelete = async (id: number) => {
    const res = await deleteRule(id)
    if (res.code === 0) {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['rules'] })
    }
  }
  const handleSubmit = async (values: formValues) => {
    if (editRule) {
      const res = await updateRule(values)
      if (res.code === 0) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['rules'] })
        setIsFormOpen(false)
      }
    } else {
      const res = await addRule(values)
      if (res.code === 0) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['rules'] })
        setIsFormOpen(false)
      }
    }
  }
  return (
    <>
      <ResponsiveModal
        title={editRule ? '编辑秩序' : '创建秩序'}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        trigger={
          <Button onClick={() => setEditRule(null)} className='rounded-full'>
            建立秩序
          </Button>
        }
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='section'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>板块</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='选择板块' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='w-full'>
                      <SelectItem value='ALL'>不限制板块</SelectItem>
                      {sections?.map((f) => (
                        <SelectItem key={f.name} value={f.name}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select
                    value={field.value}
                    disabled={!section}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='选择分类' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='w-full'>
                      <SelectItem value='ALL'>不限制类目</SelectItem>
                      {categories?.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='regex'
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

            <FormField
              control={form.control}
              name='downloader'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>下载器</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                <FormItem>
                  <FormLabel>存储路径</FormLabel>
                  <Select
                    value={field.value}
                    disabled={!downloader}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='选择路径' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='w-full'>
                      {savePaths?.map((p) => (
                        <SelectItem key={p.path} value={p.path}>
                          {p.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type='submit' className="w-full">提交</Button>
          </form>
        </Form>
      </ResponsiveModal>
      {isMobile ? (
        <RuleTableMobile
          data={data}
          onEdit={(item) => {
            setEditRule(item)
            setIsFormOpen(true)
          }}
          onDelete={(id) => handleDelete(id)}
          isLoading={isLoading}
        />
      ) : (
        <RuleTableDesktop
          data={data}
          onEdit={(item) => {
            setEditRule(item)
            setIsFormOpen(true)
          }}
          onDelete={(id) => handleDelete(id)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
