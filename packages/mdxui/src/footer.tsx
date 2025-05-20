import { ReactNode } from 'react'

export function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={className}>{children}</footer>
}
