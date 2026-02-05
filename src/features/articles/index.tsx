import { useRef, useState } from 'react'
import { LayoutGrid, List, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { uploadArticle } from '@/api/article.ts'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { ConfigDrawer } from '@/components/config-drawer'
import { ImageModeSwitch } from '@/components/image-mode-switch.tsx'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ArticlesDesktop } from '@/features/articles/components/articles-desktop.tsx'
import { ArticlesMobile } from '@/features/articles/components/articles-mobile.tsx'
import { ArticlesTable } from '@/features/articles/components/articles-table.tsx'

export function Articles() {
  const isMobile = useIsMobile()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | undefined>(undefined)
  const handleImport = async () => {
    try {
      if (file) {
        setImporting(true)
        const res = await uploadArticle(file)
        setImporting(false)
        if (res.code === 0) {
          toast.success(res.message)
        }
      }
    } finally {
      setImporting(false)
    }
  }
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className='flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60'
            title='导入数据'
          >
            {importing ? (
              <Loader2 size={18} className='animate-spin' />
            ) : (
              <Upload size={18} />
            )}
          </button>
          <input
            ref={fileRef}
            type='file'
            hidden
            accept='.xls,.xlsx,.csv'
            onChange={(e) => {
              setFile(e.currentTarget.files?.[0])
              e.currentTarget.value = ''
              handleImport()
            }}
          />
          {!isMobile && (
            <button
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className='flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'
              title={view === 'grid' ? '切换为列表' : '切换为网格'}
            >
              {view === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
          )}
          <ImageModeSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main fixed>
        {isMobile ? (
          <ArticlesMobile />
        ) : view === 'grid' ? (
          <ArticlesDesktop />
        ) : (
          <ArticlesTable />
        )}
      </Main>
    </>
  )
}
