import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

/**
 * Extracts executable code (JavaScript/TypeScript) from MDX content
 * @param ast - The MDX AST
 * @returns An array of executable code strings or a record with names and code
 */
export function extractExecutableCode(ast: Root): string[] {
  const executableCode: string[] = []

  visit(ast, 'mdxjsEsm', (node: any) => {
    if (node.value && node.value.trim()) {
      executableCode.push(node.value)
    }
  })

  visit(ast, 'code', (node: any) => {
    if (['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx'].includes(node.lang || '')) {
      executableCode.push(node.value)
    }
  })

  return executableCode
}

/**
 * Extracts UI components (JSX/React) from MDX content
 * @param ast - The MDX AST
 * @returns An array of UI component strings or a record with names and components
 */
export function extractUIComponents(ast: Root): string[] {
  const uiComponents: string[] = []

  visit(ast, 'mdxJsxFlowElement', (node: any) => {
    uiComponents.push(`<${node.name}${serializeAttributes(node.attributes)}>`)
  })

  visit(ast, 'mdxJsxTextElement', (node: any) => {
    uiComponents.push(`<${node.name}${serializeAttributes(node.attributes)}>`)
  })

  return uiComponents
}

/**
 * Helper to serialize JSX attributes
 * @param attributes - The JSX element attributes
 * @returns A string representation of the attributes
 */
function serializeAttributes(attributes: any[]): string {
  if (!attributes || attributes.length === 0) {
    return ''
  }

  return attributes
    .map((attr) => {
      if (attr.type === 'mdxJsxAttribute') {
        const value = typeof attr.value === 'string' 
          ? `"${attr.value}"` 
          : '{...}' // Placeholder for complex values
        return ` ${attr.name}=${value}`
      }
      return ''
    })
    .join('')
}
