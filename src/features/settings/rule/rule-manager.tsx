import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Regex, Trash2 } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { ResponsiveModal } from '@/components/response-modal.tsx'

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
        title={editRule ? '编辑规则' : '创建新规则'}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        trigger={
          <Button onClick={() => setEditRule(null)} className='rounded-full'>
            <Plus /> 新增规则
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
            <Button type='submit'>提交</Button>
          </form>
        </Form>
      </ResponsiveModal>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>板块</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>正则</TableHead>
              <TableHead>下载器</TableHead>
              <TableHead>保存路径</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  加载中...
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.regex}</TableCell>
                  <TableCell>{item.downloader}</TableCell>
                  <TableCell>{item.save_path}</TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='icon'
                      className="mr-2"
                      onClick={() => {
                        setEditRule(item)
                        setIsFormOpen(true)
                      }}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='outline'
                                size='icon'
                                className='text-destructive'>
                          <Trash2 className='h-4 w-4'/>
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作不可恢复，请谨慎操作。
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
