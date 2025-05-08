import yaml from 'yaml'
import type { MDXLD, ParseOptions, StringifyOptions } from './types.js'

/**
 * Extracts YAML frontmatter from MDX content
 * @param mdx - The MDX content
 * @returns The frontmatter and content
 */
function extractFrontmatter(mdx: string): { frontmatter: string | null; content: string } {
  const frontmatterMatch = mdx.match(/^---\n([\s\S]*?)\n---\n/)

  if (!frontmatterMatch) {
    return { frontmatter: null, content: mdx }
  }

  const frontmatter = frontmatterMatch[1] || null
  const content = mdx.slice(frontmatterMatch[0].length)

  return { frontmatter, content }
}

/**
 * Processes frontmatter to handle special properties and escape prefixes
 * @param frontmatter - The parsed frontmatter object
 * @returns The processed data and metadata
 */
function processFrontmatter(frontmatter: Record<string, unknown>): {
  data: Record<string, unknown>
  metadata: Partial<MDXLD>
} {
  const data: Record<string, unknown> = {}
  const metadata: Partial<MDXLD> = {}

  for (const key in frontmatter) {
    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      const value = frontmatter[key]

      // Handle @ and $ prefixed properties
      if (key.startsWith('@') || key.startsWith('$')) {
        const unquotedKey = key.startsWith('@') ? key.substring(1) : key.substring(1)

        // Only add if it's a valid key in MDXLD
        if (unquotedKey && ['type', 'context', 'id', 'language', 'base', 'vocab', 'list', 'set', 'reverse'].includes(unquotedKey)) {
          ;(metadata as Record<string, unknown>)[unquotedKey] = value
        }
      } else {
        data[key] = value
      }
    }
  }

  return { data, metadata }
}

/**
 * Parses MDX content with YAML-LD frontmatter
 * @param mdx - The MDX content
 * @param options - Parse options
 * @returns The parsed MDXLD object
 */
export function parse(mdx: string, options: ParseOptions = {}): MDXLD {
  const { frontmatter, content } = extractFrontmatter(mdx)

  const result: MDXLD = {
    data: {},
    content,
  }

  if (frontmatter) {
    try {
      const parsedYaml = yaml.parse(frontmatter)

      if (typeof parsedYaml === 'object' && parsedYaml !== null) {
        const { data, metadata } = processFrontmatter(parsedYaml)
        result.data = data

        // Copy metadata properties to result
        Object.assign(result, metadata)
      }
    } catch (error) {
      // Just continue with empty data if parsing fails
      console.error('Failed to parse frontmatter:', error)
    }
  }

  return result
}

/**
 * Stringifies an MDXLD object back to MDX content
 * @param mdxld - The MDXLD object
 * @param options - Stringify options
 * @returns The stringified MDX content
 */
export function stringify(mdxld: MDXLD, options: StringifyOptions = {}): string {
  const { data = {}, content = '', ...metadata } = mdxld
  const yamlData: Record<string, unknown> = { ...data }

  // Add metadata with @ or $ prefix
  for (const key in metadata) {
    if (
      Object.prototype.hasOwnProperty.call(metadata, key) &&
      key !== 'data' &&
      key !== 'content' &&
      key !== 'ast' &&
      key !== 'executableCode' &&
      key !== 'uiComponents'
    ) {
      const prefix = options.useAtPrefix ? '@' : '$'
      yamlData[`${prefix}${key}`] = (metadata as Record<string, unknown>)[key]
    }
  }

  const frontmatter = Object.keys(yamlData).length > 0 ? `---\n${yaml.stringify(yamlData)}---\n\n` : ''

  return `${frontmatter}${content}`
}
