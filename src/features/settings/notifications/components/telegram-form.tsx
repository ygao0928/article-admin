import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { getConfig, postConfig } from '@/api/config.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'

const telegramSchema = z.object({
  enable: z.boolean(),
  push_image: z.boolean(),
  spoiler: z.boolean(),
  bot_token: z.string(),
  chat_id: z.string(),
  template: z.string(),
  white_list:z.string(),
})

type telegramValues = z.infer<typeof telegramSchema>
const CONFIG_KEY = 'Notification.telegram'
const tgTemplate = `📰 {{ title }}

🗂 分类：{{ section }} / {{ category }}
📦 大小：{{ size }}
🗓 发布：{{ publish_date }}
🆔 TID：{{ tid }}

⬇️ 下载器：{{ downloader }}
📂 保存路径：{{ save_path }}

🔗 详情页：
{{ detail_url }}

🧲 Magnet：
{{ magnet }}
`

export function TelegramNotificationForm() {
  const queryClient = useQueryClient()

  const form = useForm<telegramValues>({
    resolver: zodResolver(telegramSchema),
    defaultValues: {
      enable: false,
      push_image: false,
      spoiler: false,
      bot_token: '',
      chat_id: '',
      white_list: '',
      template: tgTemplate,
    },
  })

  const { data } = useQuery({
    queryKey: [CONFIG_KEY],
    queryFn: async () => {
      const res = await getConfig<telegramValues>(CONFIG_KEY)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data, form])

  const onSubmit = async (values: telegramValues) => {
    const res = await postConfig(CONFIG_KEY, values as never)
    if (res.code === 0) {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: [CONFIG_KEY] })
    } else {
      toast.error(res.message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-md space-y-4'
      >
        <FormField
          control={form.control}
          name='enable'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <FormLabel>启用telegram通知</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='push_image'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <FormLabel>启用图片推送</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='spoiler'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <FormLabel>启用防剧透</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          name='bot_token'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Token</FormLabel>
              <FormControl>
                <Input placeholder='TELEGRAM_BOT_TOKEN' {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name='chat_id'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat ID</FormLabel>
              <FormControl>
                <Input placeholder='TELEGRAM_CHAT_ID' {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name='white_list'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>白名单</FormLabel>
              <FormControl>
                <Input placeholder='白名单列表，用逗号分割' {...field} />
              </FormControl>
            </FormItem>
          )}
        />


        <FormField
          name='template'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>消息模板</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit' className='min-w-[140px]'>
          <Save className='mr-2 h-4 w-4' />
          保存配置
        </Button>
      </form>
    </Form>
  )
}
