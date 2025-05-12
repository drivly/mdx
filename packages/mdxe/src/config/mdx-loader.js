import path from 'path'
import fs from 'fs'

export function getMdxContent(contentDir) {
  const mdxDir = process.env.MDXE_CONTENT_DIR || contentDir
  const files = []

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const relativePath = path.relative(mdxDir, fullPath)
        const content = fs.readFileSync(fullPath, 'utf8')
        files.push({ path: relativePath, content })
      }
    }
  }

  scanDir(mdxDir)
  return files
}
