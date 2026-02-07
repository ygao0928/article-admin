import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Copy, Zap, HelpCircle } from 'lucide-react'
import { addToken, deleteToken, listToken } from '@/api/token.ts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmButton } from '@/components/confirm-button.tsx'

export default function TokenManager() {
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const res = await listToken()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const handleCreate = async () => {
    if (!newKey.trim()) return

    const res = await addToken(newKey)
    if (res.code === 0) {
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
    }
  }

  const handleDelete = async (id: number) => {
    const res = await deleteToken(id)
    if (res.code === 0) {
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
    }
  }

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='sticky top-0 z-10 mb-2'>
        <div className='flex items-center justify-between rounded-2xl border p-4 shadow-sm md:p-6'>
          <div className='space-y-1'>
            <p className='flex items-center gap-1 text-xs text-muted-foreground md:text-sm'>
              <Zap className='h-3 w-3 fill-amber-500 text-amber-500' />
              当前令符数量: {data?.length}
            </p>

            <Popover>
              <PopoverTrigger asChild>
                <button className='flex items-center gap-1 text-xs text-primary hover:underline'>
                  <HelpCircle className='h-3 w-3' />
                  令符使用方法
                </button>
              </PopoverTrigger>

              <PopoverContent className='w-80 text-sm' align="start">
                <div className='space-y-2'>
                  <p className='font-medium'>如何使用令符</p>

                  <ol className='list-decimal space-y-1 pl-4 text-muted-foreground'>
                    <li>在请求 Header 中添加：</li>
                  </ol>

                  <pre className='break-all whitespace-pre-wrap'>
                    {`X-API-Key: YOUR_API_TOKEN`}
                  </pre>

                  <p className='text-xs text-muted-foreground'>
                    示例（curl）：
                  </p>

                  <pre className='break-all whitespace-pre-wrap'>
                    {`curl -H "X-API-Key: YOUR_API_TOKEN" https://api.example.com/v1/resource`}
                  </pre>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className='flex items-center gap-1 text-xs text-primary hover:underline'>
                  <HelpCircle className='h-3 w-3' />
                  目前开放接口
                </button>
              </PopoverTrigger>

              <PopoverContent className='w-80 text-sm' align="start">
                <div className='space-y-4'>
                  <div className='font-medium text-foreground'>已开放接口</div>

                  {/* 接口 1 */}
                  <div className='rounded-md border p-3'>
                    <div className='flex items-center justify-between'>
                      <span className='font-mono text-xs text-muted-foreground'>
                        GET /api/v1/articles/torrents
                      </span>
                      <span className='text-xs font-semibold text-green-600'>
                        GET
                      </span>
                    </div>

                    <div className='mt-2 text-xs text-muted-foreground'>
                      获取磁力种子
                    </div>

                    <div className='mt-2'>
                      <div className='text-xs font-medium'>参数</div>
                      <ul className='mt-1 list-disc pl-4 text-xs text-muted-foreground'>
                        <li>
                          <code>keyword</code>：string（必填）
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={() => setOpen(true)} className='gap-2'>
            申领令符
          </Button>
        </div>
      </div>
      <div className='flex-1 overflow-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>令符标识</TableHead>
              <TableHead>令符</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  加载中...
                </TableCell>
              </TableRow>
            )}
            {data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className='text-center'>
                  暂无数据
                </TableCell>
              </TableRow>
            )}
            {data?.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.token_key}</TableCell>
                <TableCell className='font-mono text-sm'>
                  {token.token_value}
                </TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='default'
                      onClick={() => {
                        navigator.clipboard.writeText(token.token_value)
                      }}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                    <ConfirmButton
                      variant='outline'
                      className='text-destructive'
                      title='删除令符'
                      description='删除后数据将无法恢复，是否确认？'
                      triggerText={<Trash2 className='h-4 w-4' />}
                      onConfirm={() => handleDelete(token.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申领令符</DialogTitle>
          </DialogHeader>

          <div className='space-y-2'>
            <Input
              placeholder='输入令符标识'
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
