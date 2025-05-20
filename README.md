# MDX.org.ai

## [`mdxai`](./packages/mdxai) - Generate & Edit Markdown & MDX

```bash
mdxai generate 100 blog post titles about the future of work post-AGI
```

## [`mdxdb`](./packages/mdxdb) - Markdown/MDX Files as a Database

```ts
import { ai } from 'mdxai'
import { db } from 'mdxdb'

const count = 100
const topic = 'the future of work post-AGI'
const titles = await ai.list`${count} blog post titles about ${topic}`

for (const title of titles) {
  const post = await ai`Write a blog post about ${title}`
  await db.set(`blog/${title.replace(' ', '_')}`, post)
}
```

## [`mdxld`](./packages/mdxld) - Linked Data for Markdown & MDX

## [`mdxe`](./packages/mdxe) - Build, Execute, Test, & Deploy Code in Markdown & MDX

## [`mdxui`](./packages/mdxui) - UI Component Library for MDX

All of the `mdxui` components are available automatically in `mdxe`

```mdx
<Hero
  headline='Bring your ideas to life with MDX'
  content='MDX combines unstructured content in Markdown, structured data in YAML, executable code, and UI components.'
/>
```

The components can also be used in any React/Next.js application:

```tsx
// mdx-components.tsx
export { useMDXComponents } from 'mdxui'
```
