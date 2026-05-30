import React from 'react'

export default function ModuleSubTabs({ items = [], value = '', onChange = () => {}, className = '' }) {
  return <div className={`moduleSubTabs ${className}`.trim()}>
    {items.map(item => <button key={item.id} className={value === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>{item.label}</button>)}
  </div>
}
