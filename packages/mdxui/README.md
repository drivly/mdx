# mdxui

Reusable React components for MDX-based apps.

## Installation

```bash
npm install mdxui
```

## Usage

```tsx
import { AppShell, Sidebar, NavBar, Footer, HeroSection } from 'mdxui'

export default function Example() {
  return (
    <AppShell
      nav={<NavBar title='My App' />}
      sidebar={<Sidebar>Links</Sidebar>}
      footer={<Footer>© 2025</Footer>}
    >
      <HeroSection title='Welcome' subtitle='Building with mdxui' />
    </AppShell>
  )
}
```
