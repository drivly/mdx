import { existsSync, statSync } from 'fs'
import { join, resolve, dirname, basename, extname } from 'path'

/**
 * Check if a path is a directory
 * @param {string} path - Path to check
 * @returns {boolean} - True if path is a directory
 */
export const isDirectory = (path) => {
  try {
    return statSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

/**
 * Check if a path is a markdown file
 * @param {string} path - Path to check
 * @returns {boolean} - True if path is a markdown file
 */
export const isMarkdownFile = (path) => {
  const ext = extname(path).toLowerCase()
  return ext === '.md' || ext === '.mdx'
}

/**
 * Find an index file in a directory
 * @param {string} dir - Directory to search in
 * @returns {string|null} - Path to index file or null if not found
 */
export const findIndexFile = (dir) => {
  const indexFiles = ['index.md', 'index.mdx', 'page.md', 'page.mdx', 'README.md']
  for (const file of indexFiles) {
    const filePath = join(dir, file)
    if (existsSync(filePath)) {
      return filePath
    }
  }
  return null
}

/**
 * Resolve a path to a markdown file
 * @param {string} path - Path to resolve
 * @returns {string|null} - Resolved path or null if not found
 */
export const resolvePath = (path) => {
  const absolutePath = resolve(process.cwd(), path)
  
  if (!existsSync(absolutePath)) {
    const withMdx = `${absolutePath}.mdx`
    const withMd = `${absolutePath}.md`
    
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
 * @param {string} dir - Directory to search in
 * @returns {string[]} - Array of markdown file paths
 */
export const getAllMarkdownFiles = (dir) => {
  const fs = require('fs')
  const path = require('path')
  const results = []

  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      results.push(...getAllMarkdownFiles(filePath))
    } else if (isMarkdownFile(filePath)) {
      results.push(filePath)
    }
  }
  
  return results
}

/**
 * Convert a file path to a route path
 * @param {string} filePath - File path to convert
 * @param {string} basePath - Base path to remove
 * @returns {string} - Route path
 */
export const filePathToRoutePath = (filePath, basePath) => {
  let routePath = filePath.slice(basePath.length)
  const ext = extname(routePath)
  routePath = routePath.slice(0, -ext.length)
  
  if (basename(routePath) === 'index') {
    routePath = dirname(routePath)
  }
  
  if (!routePath.startsWith('/')) {
    routePath = `/${routePath}`
  }
  
  if (routePath.endsWith('/') && routePath !== '/') {
    routePath = routePath.slice(0, -1)
  }
  
  return routePath
}
