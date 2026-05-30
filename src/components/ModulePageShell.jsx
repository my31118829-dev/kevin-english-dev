import React from 'react'
import ModuleSubTabs from './ModuleSubTabs'
import PageHeader from './PageHeader'

export default function ModulePageShell({
  pageClassName = 'practicePage',
  tabs = [],
  tabValue = '',
  onTabChange = () => {},
  headerLabel = '',
  headerTitle = '',
  headerSubtitle = '',
  children
}) {
  return <section className={`page ${pageClassName}`.trim()}>
    <ModuleSubTabs items={tabs} value={tabValue} onChange={onTabChange} />
    <PageHeader label={headerLabel} title={headerTitle} subtitle={headerSubtitle} />
    {children}
  </section>
}
