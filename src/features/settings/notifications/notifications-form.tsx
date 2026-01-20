import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx'
import { TelegramNotificationForm } from '@/features/settings/notifications/components/telegram-form.tsx'
import { WechatNotificationForm } from '@/features/settings/notifications/components/wechat-form.tsx'

export function NotificationsForm() {
  return (
    <Tabs defaultValue='wechat' className='w-full'>
      <TabsList>
        <TabsTrigger value='wechat'>企业微信</TabsTrigger>
        <TabsTrigger value='telegram'>Telegram</TabsTrigger>
      </TabsList>

      <TabsContent value='wechat'>
        <WechatNotificationForm />
      </TabsContent>

      <TabsContent value='telegram'>
        <TelegramNotificationForm />
      </TabsContent>
    </Tabs>
  )
}
