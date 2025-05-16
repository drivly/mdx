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
  
  // copy the not-found.tsx template to the app directory
  const notFoundTemplatePath = resolve(__dirname, 'templates', 'not-found.tsx')
  if (existsSync(notFoundTemplatePath)) {
    await fs.copyFile(notFoundTemplatePath, join(appDir, 'not-found.tsx'))
  } else {
    await fs.writeFile(
      join(appDir, 'not-found.tsx'),
      `export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go back home</a>
    </div>
  )
}`
    )
  }
  
  // Create the client page component
  await fs.writeFile(
    join(appDir, 'page.tsx'),
    '"use client"\n\nimport { useEffect, useState } from \'react\'\n\nexport default function Page() {\n  const [contentPaths, setContentPaths] = useState([])\n  const [isLoading, setIsLoading] = useState(true)\n  const [error, setError] = useState(null)\n  \n  useEffect(() => {\n    async function fetchContent() {\n      try {\n        setIsLoading(true)\n        const response = await fetch(\'/api/content\')\n        \n        if (!response.ok) {\n          throw new Error(\'Failed to fetch content\')\n        }\n        \n        const data = await response.json()\n        setContentPaths(data.files || [])\n      } catch (err) {\n        console.error(\'Error fetching content:\', err)\n        setError(err.message)\n      } finally {\n        setIsLoading(false)\n      }\n    }\n    \n    fetchContent()\n  }, [])\n  \n  if (isLoading) {\n    return <div className="p-4">Loading content...</div>\n  }\n  \n  if (error) {\n    return <div className="p-4 text-red-500">Error: {error}</div>\n  }\n  \n  return (\n    <div className="p-4">\n      <h1 className="text-2xl font-bold mb-4">MDXE Content</h1>\n      {contentPaths.length === 0 ? (\n        <p>No markdown content found.</p>\n      ) : (\n        <ul className="list-disc pl-6">\n          {contentPaths.map((path, index) => (\n            <li key={index} className="mb-2">\n              <a href={\'/content/\' + path.split(\'/\').pop()} className="text-blue-500 hover:underline">\n                {path.split(\'/\').pop()}\n              </a>\n            </li>\n          ))}\n        </ul>\n      )}\n    </div>\n  )\n}'
  )
  
  const cleanup = async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('Warning: Could not remove temporary directory ' + tempDir + ': ' + error.message)
    }
  }
  
  return {
    tempDir,
    appDir,
    cleanup
  }
}
