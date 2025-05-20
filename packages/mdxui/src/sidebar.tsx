import { ReactNode } from 'react'

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  return <nav className={className}>{children}</nav>
}
