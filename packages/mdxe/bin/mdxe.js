#!/usr/bin/env node

/* global process */

import { Command } from 'commander'
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { isDirectory, isMarkdownFile, findIndexFile, resolvePath, getAllMarkdownFiles, filePathToRoutePath } from '../src/utils/file-resolution.js'
import { createTempNextConfig } from '../src/utils/temp-config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJsonPath = join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(await import('fs').then((fs) => fs.readFileSync(packageJsonPath, 'utf8')))
const version = packageJson.version

const program = new Command()

program.name('mdxe').description('Zero-config CLI for serving Markdown and MDX files').version(version)

const findConfigFile = (dir, filename) => {
  const configPath = join(dir, filename)
  return existsSync(configPath) ? configPath : null
}

let activeProcess = null
let tempConfigInfo = null

process.on('SIGINT', async () => {
  if (activeProcess) {
    activeProcess.kill('SIGINT')
  }
  
  if (tempConfigInfo) {
    await tempConfigInfo.cleanup()
  }
  
  process.exit(0)
})

const runNextCommand = async (command, args = []) => {
  const userCwd = process.cwd()
  const mdxeRoot = resolve(__dirname, '..')
  const embeddedAppPath = resolve(mdxeRoot, 'src')

  try {
    const readmePath = resolve(userCwd, 'README.md')
    const hasReadme = existsSync(readmePath)
    
    const userAppDir = resolve(userCwd, 'app')
    const userPagesDir = resolve(userCwd, 'pages')
    const hasNextDirs = existsSync(userAppDir) || existsSync(userPagesDir)
    
    if ((command === 'build' || command === 'start') && !hasNextDirs) {
      console.log('No app or pages directory found. Creating minimal app directory structure...')
      
      if (!existsSync(userAppDir)) {
        await import('fs/promises').then(fs => fs.mkdir(userAppDir, { recursive: true }))
        
        const pageContent = `export default function Page() {
  return <div>Welcome to your MDX app!</div>
}`
        await import('fs/promises').then(fs => fs.writeFile(resolve(userAppDir, 'page.js'), pageContent))
        
        const layoutContent = `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
        await import('fs/promises').then(fs => fs.writeFile(resolve(userAppDir, 'layout.js'), layoutContent))
      }
    }
    
    const localNextBin = resolve(userCwd, 'node_modules', '.bin', 'next')
    const mdxeNextBin = resolve(mdxeRoot, 'node_modules', '.bin', 'next')

    let cmd, cmdArgs

    if (existsSync(localNextBin)) {
      cmd = localNextBin
      cmdArgs = [command, ...args]
    } else if (existsSync(mdxeNextBin)) {
      cmd = mdxeNextBin
      cmdArgs = [command, ...args]
    } else {
      cmd = 'npx'
      cmdArgs = ['next', command, ...args]
    }

    console.log(`Running Next.js command: ${cmd} ${cmdArgs.join(' ')}`)
    
    const cmdCwd = hasNextDirs ? userCwd : embeddedAppPath
    console.log(`Using directory: ${cmdCwd}`)
    
    activeProcess = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: true,
      cwd: cmdCwd,
      env: {
        ...process.env,
        PAYLOAD_DB_PATH: resolve(userCwd, 'mdx.db'),
        NEXT_DIST_DIR: resolve(userCwd, '.next'),
        USER_CWD: userCwd,
        README_PATH: hasReadme ? readmePath : ''
      }
    })

    activeProcess.on('error', (error) => {
      console.error(`Error executing command: ${error.message}`)
      process.exit(1)
    })

    activeProcess.on('close', (code) => {
      process.exit(code)
    })
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

program
  .command('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-H, --hostname <hostname>', 'Hostname to run the server on', 'localhost')
  .action(async (options) => {
    await runNextCommand('dev', [`--port=${options.port}`, `--hostname=${options.hostname}`])
  })

program
  .command('build')
  .description('Build the application for production')
  .action(async () => {
    await runNextCommand('build')
  })

program
  .command('start')
  .description('Start the production server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-H, --hostname <hostname>', 'Hostname to run the server on', 'localhost')
  .action(async (options) => {
    await runNextCommand('start', [`--port=${options.port}`, `--hostname=${options.hostname}`])
  })

program
  .command('lint')
  .description('Run linting on the application')
  .action(async () => {
    await runNextCommand('lint')
  })

if (!process.argv.slice(2).some(arg => ['dev', 'build', 'start', 'lint'].includes(arg))) {
  program.argument('[path]', 'Path to a markdown file or directory', '.').action(async (path) => {
    const resolvedPath = resolvePath(path)
    
    if (!resolvedPath && path !== '.') {
      console.error(`Error: Could not resolve path ${path} to a markdown file or directory with index file`)
      console.error('Make sure the path exists and is either:')
      console.error('  - A .md or .mdx file')
      console.error('  - A directory containing index.md, index.mdx, page.md, page.mdx, or README.md')
      process.exit(1)
    }
    
    if (resolvedPath) {
      console.log(`Serving markdown file: ${resolvedPath}`)
    } else {
      console.log('Starting MDX app with embedded CMS')
    }
    
    await runNextCommand('dev')
  })
}

program.parse(process.argv)
