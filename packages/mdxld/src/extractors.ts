import { visit } from 'unist-util-visit'
import type { Root, Code } from 'mdast'

/**
 * Extracts executable code (JavaScript/TypeScript) from MDX content
 * @param ast - The MDX AST
 * @returns An array of executable code strings or a record with names and code
 */
export function extractExecutableCode(ast: Root): string[] {
  const executableCode: string[] = []

  visit(ast, 'mdxjsEsm', (node) => {
    if (node && typeof node === 'object' && 'value' in node && typeof node.value === 'string' && node.value.trim()) {
      executableCode.push(node.value)
    }
  })

  visit(ast, 'code', (node) => {
    const codeNode = node as Code
    if (['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx'].includes(codeNode.lang || '')) {
      executableCode.push(codeNode.value)
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

  visit(ast, 'mdxJsxFlowElement', (node) => {
    if (node && typeof node === 'object' && 'name' in node && 'attributes' in node) {
      uiComponents.push(`<${node.name}${serializeAttributes(node.attributes)}>`)
    }
  })

  visit(ast, 'mdxJsxTextElement', (node) => {
    if (node && typeof node === 'object' && 'name' in node && 'attributes' in node) {
      uiComponents.push(`<${node.name}${serializeAttributes(node.attributes)}>`)
    }
  })

  return uiComponents
}

/**
 * Helper to serialize JSX attributes
 * @param attributes - The JSX element attributes
 * @returns A string representation of the attributes
 */
function serializeAttributes(attributes: Record<string, any>[]): string {
  if (!attributes || attributes.length === 0) {
    return ''
  }

  return attributes
    .map((attr) => {
      if (attr && typeof attr === 'object' && 'type' in attr && attr.type === 'mdxJsxAttribute' && 'name' in attr) {
        const value = typeof attr.value === 'string' ? `"${attr.value}"` : '{...}' // Placeholder for complex values
        return ` ${attr.name}=${value}`
      }
      return ''
    })
    .join('')
}
