import { ContentSection } from '@/features/settings/components/content-section.tsx'
import { FolderForm } from '@/features/settings/folder/folder-form.tsx'
import { Folder } from 'lucide-react'

export function SettingsFolder() {
  return (
    <ContentSection title='下载目录路由配置' desc='管理类目与下载目录的关系,用于自动化操作' icon={<Folder className='h-5 w-5 text-primary' />}>
      <FolderForm />
    </ContentSection>
  )
}
