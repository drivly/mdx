#!/usr/bin/env node

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const fs = await import('fs/promises')
const targetNextDir = join(rootDir, '.next')
if (existsSync(targetNextDir)) {
  await fs.rm(targetNextDir, { recursive: true, force: true })
}

const tempAppDir = join(rootDir, 'temp-app')
if (existsSync(tempAppDir)) {
  await fs.rm(tempAppDir, { recursive: true, force: true })
}
mkdirSync(tempAppDir, { recursive: true })

const appDir = join(tempAppDir, 'app')
mkdirSync(appDir, { recursive: true })

const configFiles = [
  { src: '../src/config/next.config.js', dest: 'next.config.js' },
  { src: '../src/config/tailwind.config.js', dest: 'tailwind.config.js' },
  { src: '../src/config/mdx-components.js', dest: 'mdx-components.js' }
]

for (const { src, dest } of configFiles) {
  const sourcePath = join(__dirname, src)
  const destPath = join(tempAppDir, dest)
  await fs.copyFile(sourcePath, destPath)
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

await fs.writeFile(
  join(appDir, 'page.tsx'),
  `
export default function Page() {
  return <div>MDXE Template Page</div>
}
`
)

await fs.writeFile(
  join(tempAppDir, 'package.json'),
  JSON.stringify({
    name: "mdxe-temp-app",
    version: "1.0.0",
    private: true,
    dependencies: {
      "next": "^15.0.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }, null, 2)
)

console.log('Building Next.js application...')

try {
  execSync('npm install', { 
    cwd: tempAppDir, 
    stdio: 'inherit' 
  })

  execSync('npx next build', { 
    cwd: tempAppDir, 
    stdio: 'inherit' 
  })

  const nextDir = join(tempAppDir, '.next')
  await fs.cp(nextDir, targetNextDir, { recursive: true })

  console.log('Next.js build completed successfully')
  console.log('.next directory copied to package root')

  await fs.rm(tempAppDir, { recursive: true, force: true })
} catch (error) {
  console.error('Error building Next.js application:', error.message)
  process.exit(1)
}
