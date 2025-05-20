import { ReactNode } from 'react'

export function AppShell({ nav, sidebar, footer, children }: { nav?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className='app-shell'>
      {nav && <header>{nav}</header>}
      <div className='app-body'>
        {sidebar && <aside>{sidebar}</aside>}
        <main>{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  )
}
