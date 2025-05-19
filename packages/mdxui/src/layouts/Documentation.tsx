import { ReactNode } from 'react'

interface DocumentationProps {
  sidebar: ReactNode
  children: ReactNode
  className?: string
  sidebarClassName?: string
  contentClassName?: string
}

export function Documentation({ sidebar, children, className, sidebarClassName, contentClassName }: DocumentationProps) {
  return (
    <div className={className} style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className={sidebarClassName} style={{ width: '250px', flexShrink: 0 }}>
        {sidebar}
      </aside>
      <main className={contentClassName} style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  )
}
