# mdxld

A modern TypeScript package for Markdown & MDX parsing with integrated YAML-LD frontmatter support. Parse MDX documents with type-safe YAML-LD frontmatter and optional AST support.

## Features

- 🔒 Full YAML-LD support in frontmatter with type-safe parsing
- 🔄 Support for both @ and $ property prefixes ($ preferred)
- 🌳 Optional AST parsing with common remark plugins
- 🔗 Optional Linked Data $context / $type enrichment
- 📦 Separate entry points for core and AST functionality
- 🚀 Built with TypeScript for type safety
- 🧩 Component separation into structured data, unstructured content, executable code, and UI components

## Usage

### Basic Usage

```typescript
import { parse, stringify } from 'mdxld'

const mdx = parse(`---
$type: 'https://mdx.org.ai/Document'
$context: 'https://schema.org'
title: 'My Document'
description: 'A sample document'
author: 'John Doe'
---

# Hello World
`)

console.log(mdx)
// Output:
// {
//   type: 'https://mdx.org.ai/Document',
//   context: 'https://schema.org',
//   data: {
//     title: 'My Document',
//     description: 'A sample document',
//     author: 'John Doe'
//   },
//   content: '# Hello World\n',
//   executableCode: [],
//   uiComponents: []
// }
```

### AST Support

For AST parsing with remark plugins:

```typescript
import { parse } from 'mdxld/ast'

const mdx = parse(
  `---
$type: 'https://mdx.org.ai/Document'
title: 'My Document'
---

# Hello World

import { Button } from 'ui'

<Button>Click me</Button>
`,
  { extractComponents: true },
)

// Includes AST from remark parsing
console.log(mdx.ast)

// Includes extracted executable code
console.log(mdx.executableCode)
// Output: ["import { Button } from 'ui'"]

// Includes extracted UI components
console.log(mdx.uiComponents)
// Output: ["<Button>"]
```

### Component Extraction

To extract executable code and UI components:

```typescript
import { parse } from 'mdxld/ast'

const mdx = parse(
  `---
$type: 'https://mdx.org.ai/Document'
title: 'My Document'
---

# Hello World

import { Button } from 'ui'

export function Example() {
  return <div>Example</div>
}

<Button>Click me</Button>
`,
  { extractComponents: true },
)

console.log(mdx.executableCode)
// Output: ["import { Button } from 'ui'", "export function Example() {\n  return <div>Example</div>\n}"]

console.log(mdx.uiComponents)
// Output: ["<Button>", "<div>"]
```

### Validation

To validate the different components:

```typescript
import { validateStructuredData, validateContent, validateExecutableCode, validateUIComponents } from 'mdxld'

const isValidData = validateStructuredData(mdx.data)
const isValidContent = validateContent(mdx.content)
const isValidCode = validateExecutableCode(mdx.executableCode)
const isValidComponents = validateUIComponents(mdx.uiComponents)
```

## License

MIT © [Drivly](https://mdxld.org)
