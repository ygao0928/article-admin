import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { clearUser, getResetToken } from '@/api/user.ts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  token: z.string().min(1, '输入口令'),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const res = await clearUser(data.token)
    if (res.code === 0) {
      toast.success('前往注册账号')
      navigate({ to: '/sign-up', replace: true })
    } else {
      toast.error(res.message)
    }
  }

  async function handleGenerateToken() {
    const res = await getResetToken()
    if (res.code === 0) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='token'
          render={({ field }) => (
            <FormItem>
              {/* 修改：让 Label 和 生成按钮 在同一行 */}
              <div className='flex items-center justify-between'>
                <FormLabel>口令</FormLabel>
                <Button
                  type='button' // 必须指定 type="button"，否则会触发 form submit
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-xs text-muted-foreground'
                  onClick={handleGenerateToken}
                >
                  <RefreshCcw className='mr-1 h-3 w-3' />
                  随机生成
                </Button>
              </div>

              <FormControl>
                <Input placeholder='输入或生成口令' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2 w-full' disabled={isLoading}>
          继续
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  )
}
