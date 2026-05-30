import React from 'react'

export default function PageHeader({ label = '', title = '', subtitle = '' }) {
  return <div className="pageHeader">
    <span>{label}</span>
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </div>
}
