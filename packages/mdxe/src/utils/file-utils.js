import { existsSync, statSync } from 'fs'
import { join, resolve, extname } from 'path'
import fs from 'fs/promises'

/**
 * Check if a path is a directory
 */
export function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * Check if a file is a Markdown file
 */
export function isMarkdownFile(path) {
  const ext = extname(path).toLowerCase()
  return ext === '.md' || ext === '.mdx'
}

/**
 * Find an index file in a directory
 */
export async function findIndexFile(dir) {
  const indexFiles = ['index.md', 'index.mdx', 'README.md']
  
  for (const file of indexFiles) {
    const filePath = join(dir, file)
    if (existsSync(filePath)) {
      return filePath
    }
  }
  
  return null
}

/**
 * Resolve a path to an MDX file
 */
export async function resolveMdxPath(slugPath) {
  // Use USER_CWD environment variable if available, otherwise use process.cwd()
  const userCwd = process.env.USER_CWD || process.cwd()
  console.log('User CWD:', userCwd)
  console.log('Slug path:', slugPath)
  
  const absolutePath = resolve(userCwd, slugPath)
  console.log('Absolute path:', absolutePath)
  
  if (!existsSync(absolutePath)) {
    const withMdx = `${absolutePath}.mdx`
    const withMd = `${absolutePath}.md`
    
    console.log('Checking with extensions:', withMdx, withMd)
    
    if (existsSync(withMdx)) return withMdx
    if (existsSync(withMd)) return withMd
    
    return null
  }
  
  if (isDirectory(absolutePath)) {
    return findIndexFile(absolutePath)
  }
  
  if (isMarkdownFile(absolutePath)) {
    return absolutePath
  }
  
  return null
}

/**
 * Get all markdown files in a directory recursively
 */
export async function getAllMarkdownFiles(dir) {
  const results = []
  const files = await fs.readdir(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = await fs.stat(filePath)
    
    if (stat.isDirectory()) {
      results.push(...await getAllMarkdownFiles(filePath))
    } else if (isMarkdownFile(filePath)) {
      results.push(filePath)
    }
  }
  
  return results
}

/**
 * Convert a file path to a route path
 */
export function filePathToRoutePath(filePath) {
  const cwd = process.cwd()
  const relativePath = filePath.replace(cwd, '')
  
  let routePath = relativePath.replace(/^\//, '').replace(/\.(md|mdx)$/, '')
  
  if (routePath.endsWith('/index') || routePath === 'index') {
    routePath = routePath.replace(/\/index$/, '')
  }
  
  return routePath
}
