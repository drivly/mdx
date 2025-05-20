import { ReactNode } from 'react'

export function NavBar({ title, children, className }: { title?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {title && <span>{title}</span>}
      {children}
    </div>
  )
}
