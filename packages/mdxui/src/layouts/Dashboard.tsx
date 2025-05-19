import { type JSX, type ReactNode } from 'react'

export interface DashboardLayoutProps {
  widgets?: ReactNode
  activity?: ReactNode
  className?: string
}

export function DashboardLayout({ widgets, activity, className }: DashboardLayoutProps): JSX.Element {
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className ?? ''}`}>
      <section className='space-y-4 md:col-span-2'>{widgets}</section>
      <section className='space-y-4 md:col-span-1'>{activity}</section>
    </div>
  )
}
