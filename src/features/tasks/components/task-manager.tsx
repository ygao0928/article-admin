import { useState, useEffect } from 'react'
import * as z from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TaskFunction } from '@/types/config.ts'
import { Plus, Pencil, Trash2, Clock, Zap, Play } from 'lucide-react'
import { toast } from 'sonner'
import { getConfig } from '@/api/config.ts'
import { addTask, deleteTask, getTasks, updateTask } from '@/api/task.ts'
import { cn } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea.tsx'

export interface Task {
  id: number
  task_name: string
  task_func: string
  task_args: string
  task_cron: string
  enable: boolean
}

const taskSchema = z.object({
  task_name: z.string().min(2, '任务名称至少2个字符'),
  task_func: z.string().min(1, '请选择执行函数'),
  task_args: z.string(),
  task_cron: z.string().min(5, '请输入有效的 Cron 表达式'),
  enable: z.boolean(),
})

export default function TaskManager() {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const saveTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof taskSchema>) => {
      if (editingTask) {
        return await updateTask({
          ...values,
          id: editingTask.id,
        })
      } else {
        return await addTask({
          ...values,
          id: 0,
        })
      }
    },

    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsFormOpen(false)
      setEditingTask(null)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { data: taskFunctions } = useQuery({
    queryKey: ['taskFunc'],
    queryFn: async () => {
      const res = await getConfig<TaskFunction[]>('TaskFunction')
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_name: '',
      task_func: '',
      task_args: '',
      task_cron: '0 * * * *',
      enable: true,
    },
  })

  const selectedFunc = useWatch({
    control: form.control,
    name: 'task_func',
  })

  // 处理编辑状态回填
  useEffect(() => {
    if (editingTask) {
      form.reset(editingTask)
    } else if (isFormOpen) {
      form.reset({
        task_name: '',
        task_func: '',
        task_args: '',
        task_cron: '0 * * * *',
        enable: true,
      })
    }
  }, [editingTask, isFormOpen, form])

  const handleDelete = async (id: number) => {
    deleteTaskMutation.mutate(id)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between rounded-2xl border p-4 shadow-sm md:p-6'>
        <div className='space-y-1'>
          <p className='flex items-center gap-1 text-xs text-muted-foreground md:text-sm'>
            <Zap className='h-3 w-3 fill-amber-500 text-amber-500' />
            当前活跃任务: {tasks?.length}
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingTask(null)}
              className='rounded-full px-5'
            >
              <Plus className='mr-2 h-4 w-4' /> 新增任务
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? '编辑任务' : '创建新任务'}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  saveTaskMutation.mutate(values)
                })}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='task_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务名称</FormLabel>
                      <FormControl>
                        <Input placeholder='输入任务名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='task_func'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>执行函数</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择函数' />
                          </SelectTrigger>
                          <SelectContent className='w-full'>
                            {taskFunctions?.map((f) => (
                              <SelectItem key={f.func_name} value={f.func_name}>
                                {f.func_label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='task_args'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>函数参数</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='{"arg_name":"arg_value"}'
                        ></Textarea>
                      </FormControl>
                      <FormDescription>
                        <span>
                          {
                            taskFunctions?.find(
                              (f) => f.func_name === selectedFunc
                            )?.func_args_description
                          }
                        </span>
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='task_cron'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cron 表达式</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input {...field} />
                          <Clock className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        </div>
                      </FormControl>
                      <FormDescription>
                        <span className='rounded bg-muted px-1.5 py-0.5 italic'>
                          */5 * * * * (每5分)
                        </span>
                        <span className='rounded bg-muted px-1.5 py-0.5 italic'>
                          0 0 * * * (每日)
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='enable'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <FormLabel>开启任务</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type='submit' disabled={saveTaskMutation.isPending}>
                    {saveTaskMutation.isPending ? '保存中...' : '保存配置'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className='overflow-hidden rounded-2xl border shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>任务名称</TableHead>
              <TableHead>执行逻辑</TableHead>
              <TableHead>Cron 周期</TableHead>
              <TableHead className='sticky right-0 text-right'>管理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id} className='group transition-colors'>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        task.enable
                          ? 'animate-pulse bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                          : 'bg-slate-400 shadow-none'
                      )}
                    />
                    <span className='font-semibold'>{task.task_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='font-mono'>
                      {task.task_func}
                    </Badge>
                    <span className='text-xs text-muted-foreground'>→</span>
                    <span className='text-xs text-slate-600'>
                      {task.task_args}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='font-mono text-sm text-muted-foreground'>
                  {task.task_cron}
                </TableCell>
                <TableCell className='sticky right-0 text-right'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setEditingTask(task)
                        setIsFormOpen(true)
                      }}
                    >
                      <Play className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setEditingTask(task)
                        setIsFormOpen(true)
                      }}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-destructive'
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
