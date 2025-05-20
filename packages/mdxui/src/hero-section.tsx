import { ReactNode } from 'react'

export function HeroSection({ title, subtitle, children, className }: { title: string; subtitle?: string; children?: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  )
}
