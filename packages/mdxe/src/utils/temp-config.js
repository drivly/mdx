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
  
  const pagesDir = join(tempDir, 'pages')
  mkdirSync(pagesDir, { recursive: true })
  
  const mdxeDir = resolve(__dirname, '..', '..')
  const configFiles = [
    { src: join(mdxeDir, 'src', 'config', 'next.config.js'), dest: join(tempDir, 'next.config.js') },
    { src: join(mdxeDir, 'src', 'config', 'tailwind.config.js'), dest: join(tempDir, 'tailwind.config.js') },
    { src: join(mdxeDir, 'src', 'config', 'mdx-components.js'), dest: join(tempDir, 'mdx-components.js') }
  ]
  
  // Create ESLint configuration to prevent prompts during lint
  await fs.writeFile(
    join(tempDir, '.eslintrc.json'),
    JSON.stringify({
      extends: "next/core-web-vitals"
    }, null, 2)
  )
  
  for (const { src, dest } of configFiles) {
    await fs.copyFile(src, dest)
  }
  
  // Create _document.js in pages directory to properly handle Html component
  await fs.writeFile(
    join(pagesDir, '_document.js'),
    `import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="prose prose-slate max-w-7xl mx-auto p-4">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
`
  )
  
  // Create _app.js in pages directory to handle global styles and layouts
  await fs.writeFile(
    join(pagesDir, '_app.js'),
    `import React from 'react'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
`
  )
  
  // Create index.js in pages directory to serve as the main page
  await fs.writeFile(
    join(pagesDir, 'index.js'),
    `import React from 'react'

export default function Home() {
  return (
    <div>
      <h1>MDXE Content</h1>
      <p>Welcome to your MDX content site.</p>
    </div>
  )
}
`
  )
  
  // Create a pages API route for content listing instead of App Router API route
  const pagesApiDir = join(pagesDir, 'api')
  mkdirSync(pagesApiDir, { recursive: true })
  
  const contentApiPageDir = join(pagesApiDir, 'content')
  mkdirSync(contentApiPageDir, { recursive: true })
  
  await fs.writeFile(
    join(contentApiPageDir, 'index.js'),
    `import { readdir } from 'fs/promises'
import { join } from 'path'

export default async function handler(req, res) {
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
    
    res.status(200).json({ files: filePaths })
  } catch (error) {
    console.error('Error loading content:', error)
    res.status(500).json({ files: [], error: error.message })
  }
}
`
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
    pagesDir,
    cleanup
  }
}
