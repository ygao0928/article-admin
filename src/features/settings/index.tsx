import { Outlet } from '@tanstack/react-router';
import {
  Bell,
  Download,
  Folder,
  UserPen,
  Settings2,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { TopNav } from '@/features/settings/components/top-nav.tsx';
import { ImageModeSwitch } from '@/components/image-mode-switch.tsx'


const sidebarNavItems = [
  {
    title: '账户',
    href: '/settings',
    icon: <UserPen size={18} />,
  },
  {
    title: '目录',
    href: '/settings/folder',
    icon: <Folder size={18} />,
  },
  {
    title: '下载器',
    href: '/settings/downloader',
    icon: <Download size={18} />,
  },
  {
    title: '通知',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  }
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ImageModeSwitch/>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main className='flex h-[calc(100vh-4rem)] flex-col'>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">服务器配置</h1>
          </div>
          <p className="text-muted-foreground">
            配置和管理您的下载器、通知渠道等
          </p>
        </div>
        <TopNav items={sidebarNavItems} />
        <div className="flex-1 overflow-y-auto">
          <Outlet/>
        </div>
      </Main>
    </>
  )
}
