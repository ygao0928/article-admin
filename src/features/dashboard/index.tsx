import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/article.ts'
import { getDownloadState } from '@/api/download-log.ts'
import { ConfigDrawer } from '@/components/config-drawer'
import { ImageModeSwitch } from '@/components/image-mode-switch.tsx'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CategoryCards } from '@/features/dashboard/components/category-cards.tsx'
import { DownloadDashboard } from '@/features/dashboard/components/download-state.tsx'
import { SummaryCards } from '@/features/dashboard/components/summary-cards.tsx'

export function Dashboard() {
  const { data } = useQuery({
    queryKey: ['category'],
    queryFn: async () => {
      const res = await getCategories()
      return res?.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: state } = useQuery({
    queryKey: ['downloadState'],
    queryFn: async () => {
      const res = await getDownloadState()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ImageModeSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='space-y-6 p-2'>
          <DownloadDashboard data={state ?? {download_count:0,section_count:[]}} />
          <SummaryCards data={data ?? []} />
          <CategoryCards data={data ?? []} />
        </div>
      </Main>
    </>
  )
}
