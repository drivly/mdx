import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMDX from 'remark-mdx'
import remarkGFM from 'remark-gfm'
import type { Root } from 'mdast'
import { extractExecutableCode, extractUIComponents } from './extractors.js'

describe('extractors', () => {
  const parseMarkdown = (markdown: string): Root => {
    return unified().use(remarkParse).use(remarkMDX).use(remarkGFM).parse(markdown) as Root
  }

  describe('extractExecutableCode', () => {
    it('should extract import statements', () => {
      const markdown = `# Test

import { Button } from 'ui'
`
      const ast = parseMarkdown(markdown)
      const result = extractExecutableCode(ast)

      expect(result).toHaveLength(1)
      expect(result[0]).toContain("import { Button } from 'ui'")
    })

    it('should extract JavaScript code blocks', () => {
      const markdown = `# Test

\`\`\`js
function example() {
  return 'Hello'
}
\`\`\`
`
      const ast = parseMarkdown(markdown)
      const result = extractExecutableCode(ast)

      expect(result).toHaveLength(1)
      expect(result[0]).toContain("function example()")
    })
  })

  describe('extractUIComponents', () => {
    it('should extract JSX elements', () => {
      const markdown = `# Test

<Button>Click me</Button>
`
      const ast = parseMarkdown(markdown)
      const result = extractUIComponents(ast)

      expect(result).toHaveLength(1)
      expect(result[0]).toContain("<Button")
    })

    it('should extract JSX elements with attributes', () => {
      const markdown = `# Test

<Button variant="primary" onClick={() => {}}>Click me</Button>
`
      const ast = parseMarkdown(markdown)
      const result = extractUIComponents(ast)

      expect(result).toHaveLength(1)
      expect(result[0]).toContain("<Button")
      expect(result[0]).toContain('variant="primary"')
    })
  })
})
