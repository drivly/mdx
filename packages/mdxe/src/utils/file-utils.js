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
  
  if (shouldExcludePath(slugPath)) {
    console.log('Skipping excluded path:', slugPath)
    return null
  }
  
  const absolutePath = resolve(userCwd, slugPath)
  console.log('Absolute path:', absolutePath)
  
  if (shouldExcludePath(absolutePath)) {
    console.log('Skipping excluded absolute path:', absolutePath)
    return null
  }
  
  if (!existsSync(absolutePath)) {
    const withMdx = `${absolutePath}.mdx`
    const withMd = `${absolutePath}.md`
    
    console.log('Checking with extensions:', withMdx, withMd)
    
    if (existsSync(withMdx) && !shouldExcludePath(withMdx)) return withMdx
    if (existsSync(withMd) && !shouldExcludePath(withMd)) return withMd
    
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
 * Check if a path should be excluded from processing
 */
export function shouldExcludePath(path) {
  const excludedDirs = ['node_modules', '.git', '.next', 'dist', 'build']
  return excludedDirs.some(dir => path.includes(`/${dir}/`) || path.endsWith(`/${dir}`))
}

/**
 * Get all markdown files in a directory recursively
 */
export async function getAllMarkdownFiles(dir) {
  const results = []
  
  try {
    const files = await fs.readdir(dir)
    
    for (const file of files) {
      const filePath = join(dir, file)
      
      if (shouldExcludePath(filePath)) {
        continue
      }
      
      try {
        const stat = await fs.stat(filePath)
        
        if (stat.isDirectory()) {
          results.push(...await getAllMarkdownFiles(filePath))
        } else if (isMarkdownFile(filePath)) {
          results.push(filePath)
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
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
