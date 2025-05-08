import fs from 'fs-extra'
import path from 'path'
import { MDXData, MDXListItem } from './types'

/**
 * Writes data to an MDX file at the specified path
 * @param pathSegments Array of path segments that form the file path
 * @param data The data to write to the file
 * @returns The data that was written
 */
export async function writeMDX(pathSegments: string[], data: MDXData): Promise<MDXData> {
  const filePath = `.db/${pathSegments.join('/')}.mdx`
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  const content = `---\n${JSON.stringify(data, null, 2)}\n---\n`
  await fs.writeFile(filePath, content)
  return data
}

/**
 * Reads data from an MDX file at the specified path
 * @param pathSegments Array of path segments that form the file path
 * @returns The data from the file or null if the file doesn't exist
 */
export async function readMDX(pathSegments: string[]): Promise<MDXData | null> {
  const filePath = `.db/${pathSegments.join('/')}.mdx`
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---\n/)
    if (match && match[1]) {
      return JSON.parse(match[1])
    }
    throw new Error('Invalid MDX file format')
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

/**
 * Lists all MDX files in a directory
 * @param pathSegments Array of path segments that form the directory path
 * @returns Array of objects containing the file ID and its data
 */
export async function listMDX(pathSegments: string[]): Promise<MDXListItem[]> {
  const dirPath = `.db/${pathSegments.join('/')}`
  try {
    await fs.mkdir(dirPath, { recursive: true })
    const files = await fs.readdir(dirPath)

    const results: MDXListItem[] = []
    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const id = file.replace(/\.mdx$/, '')
        const data = await readMDX([...pathSegments, id])
        if (data) {
          results.push({ id, ...data })
        }
      }
    }

    return results
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}
