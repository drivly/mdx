'use client'

export interface DocsSection {
  href: string
  label: string
}

const DEFAULT_SECTIONS: DocsSection[] = [
  { href: '/docs/introduction', label: 'Introduction' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/api', label: 'API Reference' },
  { href: '/docs/faq', label: 'FAQ' },
]

export function DocsSidebar({ sections = DEFAULT_SECTIONS }: { sections?: DocsSection[] }) {
  return (
    <aside>
      <nav>
        <ul>
          {sections.map((s) => (
            <li key={s.href}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
