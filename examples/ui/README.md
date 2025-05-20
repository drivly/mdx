# mdxui Component Examples

This example shows how to compose the basic `mdxui` components.

```tsx
import { AppShell, NavBar, Sidebar, Footer, HeroSection } from 'mdxui'

export default function Demo() {
  return (
    <AppShell
      nav={<NavBar title='Demo' />}
      sidebar={<Sidebar>Menu</Sidebar>}
      footer={<Footer>Footer</Footer>}
    >
      <HeroSection title='Hello' subtitle='mdxui components in action' />
    </AppShell>
  )
}
```
