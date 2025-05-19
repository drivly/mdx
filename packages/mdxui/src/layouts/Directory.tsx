import { type JSX } from 'react'

export function DirectoryLayout({ header, children, className }: { header?: React.ReactNode; children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <div className={className}>
      {header && <header>{header}</header>}
      <main>{children}</main>
    </div>
  )
}
