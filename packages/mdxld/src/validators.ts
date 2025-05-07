/**
 * Validates structured data (YAML frontmatter)
 * @param data - The structured data to validate
 * @returns Whether the data is valid
 */
export function validateStructuredData(data: Record<string, unknown>): boolean {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

/**
 * Validates unstructured content (Markdown)
 * @param content - The content to validate
 * @returns Whether the content is valid
 */
export function validateContent(content: string): boolean {
  return typeof content === 'string'
}

/**
 * Validates executable code (JavaScript/TypeScript)
 * @param code - The code to validate
 * @returns Whether the code is valid
 */
export function validateExecutableCode(code: string[] | Record<string, string>): boolean {
  if (Array.isArray(code)) {
    return code.every(item => typeof item === 'string')
  }
  
  if (typeof code === 'object' && code !== null) {
    return Object.values(code).every(item => typeof item === 'string')
  }
  
  return false
}

/**
 * Validates UI components (JSX/React)
 * @param components - The components to validate
 * @returns Whether the components are valid
 */
export function validateUIComponents(components: string[] | Record<string, string>): boolean {
  if (Array.isArray(components)) {
    return components.every(item => typeof item === 'string')
  }
  
  if (typeof components === 'object' && components !== null) {
    return Object.values(components).every(item => typeof item === 'string')
  }
  
  return false
}
