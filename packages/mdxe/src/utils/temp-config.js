import { join, resolve, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Creates a temporary Next.js configuration directory
 * @param {string} contentDir - The content directory to use
 * @returns {object} - Object containing paths and cleanup function
 */
export async function createTempNextConfig(contentDir) {
  const fs = await import('fs/promises')
  const randomId = Math.random().toString(36).substring(2, 15)
  const tempDir = join(tmpdir(), `mdxe-${randomId}`)
  
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }
  
  const appDir = join(tempDir, 'app')
  mkdirSync(appDir, { recursive: true })
  
  // Create API directory for server components
  const apiDir = join(appDir, 'api')
  mkdirSync(apiDir, { recursive: true })
  
  const contentApiDir = join(apiDir, 'content')
  mkdirSync(contentApiDir, { recursive: true })
  
  const mdxeDir = resolve(__dirname, '..', '..')
  const configFiles = [
    { src: join(mdxeDir, 'src', 'config', 'next.config.js'), dest: join(tempDir, 'next.config.js') },
    { src: join(mdxeDir, 'src', 'config', 'tailwind.config.js'), dest: join(tempDir, 'tailwind.config.js') },
    { src: join(mdxeDir, 'src', 'config', 'mdx-components.js'), dest: join(tempDir, 'mdx-components.js') }
  ]
  
  for (const { src, dest } of configFiles) {
    await fs.copyFile(src, dest)
  }
  
  // Create next.config.js with simplified configuration
  await fs.writeFile(
    join(tempDir, 'next.config.js'),
    `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  useFileSystemPublicRoutes: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  pageExtensions: ['tsx', 'jsx', 'js', 'ts'],
  distDir: '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
}
`
  )
  
  await fs.writeFile(
    join(appDir, 'layout.tsx'),
    `
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
  )
  
  // Create the API route for content listing
  await fs.writeFile(
    join(contentApiDir, 'route.js'),
    `import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const contentDir = process.env.MDXE_CONTENT_DIR || '.'
    const filePaths = []
    
    async function findMarkdownFiles(dir) {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await findMarkdownFiles(fullPath)
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          filePaths.push(fullPath)
        }
      }
    }
    
    await findMarkdownFiles(contentDir)
    
    return Response.json({ files: filePaths })
  } catch (error) {
    console.error('Error loading content:', error)
    return Response.json({ files: [], error: error.message }, { status: 500 })
  }
}
`
  )
  
  // Create the client page component
  await fs.writeFile(
    join(appDir, 'page.tsx'),
    `"use client"

import { useEffect, useState } from 'react'

export default function Page() {
  const [contentPaths, setContentPaths] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/content')
        
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        
        const data = await response.json()
        setContentPaths(data.files)
      } catch (err) {
        console.error('Error fetching content:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [])
  
  if (isLoading) {
    return <div className="p-4">Loading content...</div>
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MDXE Content</h1>
      {contentPaths.length === 0 ? (
        <p>No markdown content found.</p>
      ) : (
        <ul className="list-disc pl-6">
          {contentPaths.map((path, index) => (
            <li key={index} className="mb-2">
              <a href={'/content/' + path.replace(process.env.MDXE_CONTENT_DIR || '.', '')} className="text-blue-500 hover:underline">
                {path.split('/').pop()}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}`
  )
  
  const cleanup = async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      console.warn(`Warning: Could not remove temporary directory ${tempDir}: ${error.message}`)
    }
  }
  
  return {
    tempDir,
    appDir,
    cleanup
  }
}
