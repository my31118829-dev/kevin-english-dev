import React from 'react'

const MAIN_TABS = [
  { id: 'learn', label: '学习' },
  { id: 'practice', label: '练习' },
  { id: 'output', label: '输出' },
  { id: 'review', label: '复习' },
  { id: 'library', label: '图书馆' }
]

export default function GlobalAppNav({
  tab = 'learn',
  showSettingsButton = true,
  onOpenSettings = () => {},
  onNavigate = () => {}
}) {
  return <>
    {showSettingsButton && <button className="globalSettingsButton" onClick={onOpenSettings} aria-label="Settings">⚙︎</button>}
    <nav className="tabs">
      {MAIN_TABS.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.label}</button>)}
    </nav>
  </>
}
