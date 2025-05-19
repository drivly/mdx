import { type JSX } from 'react'

export function AppLayout({ navigation, children, className }: { navigation: React.ReactNode; children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <div className={`flex min-h-screen ${className ?? ''}`.trim()}>
      <nav className='w-64 border-r'>{navigation}</nav>
      <main className='flex-1 p-4'>{children}</main>
    </div>
  )
}
