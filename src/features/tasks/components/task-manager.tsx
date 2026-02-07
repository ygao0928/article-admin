import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import {
  addTask,
  deleteTask,
  fetchFuncList,
  getTasks,
  runTask,
  type Task,
  updateTask,
} from '@/api/task.ts'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea.tsx'
import { ResponsiveModal } from '@/components/response-modal.tsx'
import { TaskTableDesktop } from '@/features/tasks/components/task-table-desktop.tsx'
import { TaskTableMobile } from '@/features/tasks/components/task-table-mobile.tsx'

const taskSchema = z.object({
  task_name: z.string().min(2, '任务名称至少2个字符'),
  task_func: z.string().min(1, '请选择执行函数'),
  task_args: z.string(),
  task_cron: z.string().min(5, '请输入有效的 Cron 表达式'),
  enable: z.boolean(),
})

type taskValues = z.infer<typeof taskSchema>

const defaultValues = {
  task_name: '',
  task_func: '',
  task_args: '',
  task_cron: '0 * * * *',
  enable: true,
}

export default function TaskManager() {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const args_list_to_json_str = (arg_list: string[]) => {
    const obj = Object.fromEntries(arg_list.map((key) => [key, '']))
    return JSON.stringify(obj)
  }

  const saveTaskMutation = useMutation({
    mutationFn: async (values: taskValues) => {
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
      if (res.code === 0) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        setIsFormOpen(false)
        setEditingTask(null)
      }
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
      const res = await fetchFuncList()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const form = useForm<taskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultValues,
  })

  const selectedFunc = useWatch({
    control: form.control,
    name: 'task_func',
  })

  const func_arg = taskFunctions?.find(
    (f) => f.func_name === selectedFunc
  )?.func_args

  // 处理编辑状态回填
  useEffect(() => {
    if (editingTask) {
      form.reset(editingTask)
    } else if (isFormOpen) {
      form.reset(defaultValues)
    }
  }, [editingTask, isFormOpen, form])

  const handleDelete = async (id: number) => {
    deleteTaskMutation.mutate(id)
  }

  const handleRunTask = async (taskId: number) => {
    const res = await runTask(taskId)
    toast.success(res.message)
  }

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='sticky top-0 z-10 mb-2'>
        <div className='flex items-center justify-between rounded-2xl border p-4 shadow-sm md:p-6'>
          <div className='space-y-1'>
            <p className='flex items-center gap-1 text-xs text-muted-foreground md:text-sm'>
              <Zap className='h-3 w-3 fill-amber-500 text-amber-500' />
              当前活跃阵法: {tasks?.filter((item) => item.enable).length}
            </p>
          </div>
          <ResponsiveModal
            title={editingTask ? '编排阵法' : '录入阵法'}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            trigger={
              <Button
                onClick={() => setEditingTask(null)}
                className='rounded-full'
              >
                <Plus /> 录入阵法
              </Button>
            }
          >
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
                      <FormLabel>阵法名称</FormLabel>
                      <FormControl>
                        <Input placeholder='输入阵法名称' {...field} />
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
                      <FormLabel>阵法核心</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择核心' />
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
                      <FormLabel>核心参数</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='{"arg_name":"arg_value"}'
                        ></Textarea>
                      </FormControl>
                      <FormDescription>
                        <span>
                          参考参数: {args_list_to_json_str(func_arg || [])}
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
                      <FormLabel>运转周期</FormLabel>
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
                <Button
                  type='submit'
                  disabled={saveTaskMutation.isPending}
                  className='w-full'
                >
                  {saveTaskMutation.isPending ? '保存中...' : '保存配置'}
                </Button>
              </form>
            </Form>
          </ResponsiveModal>
        </div>
      </div>
      <div className='flex-1 overflow-auto'>
        {isMobile ? (
          <TaskTableMobile
            data={tasks}
            isLoading={isLoading}
            onRun={handleRunTask}
            onDelete={handleDelete}
            onEdit={(task) => {
              setEditingTask(task)
              setIsFormOpen(true)
            }}
          />
        ) : (
          <TaskTableDesktop
            data={tasks}
            isLoading={isLoading}
            onRun={handleRunTask}
            onDelete={handleDelete}
            onEdit={(task) => {
              setEditingTask(task)
              setIsFormOpen(true)
            }}
          ></TaskTableDesktop>
        )}
      </div>
    </div>
  )
}
