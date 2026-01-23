import { ContentSection } from '@/features/settings/components/content-section.tsx'
import { Route } from 'lucide-react'
import RulesManager from '@/features/settings/rule/rule-manager.tsx'

export function SettingsRule() {
  return (
    <ContentSection title='下载目录路由配置' desc='管理类目与下载目录的关系,用于自动化操作' icon={<Route className='h-5 w-5 text-primary' />}>
      <RulesManager />
    </ContentSection>
  )
}
