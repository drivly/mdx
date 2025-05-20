#!/usr/bin/env node

import { Command } from 'commander'
import { spawn } from 'child_process'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJson = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), 'utf8'))
const version = packageJson.version

const program = new Command()
program
  .name('mdx')
  .description('Simple MDX file server with Next.js')
  .version(version)

let activeProcess = null
process.on('SIGINT', () => {
  if (activeProcess) {
    activeProcess.kill('SIGINT')
  }
  process.exit(0)
})

function ensureCustom404Page(userCwd) {
  const pagesDir = join(userCwd, 'pages')
  const custom404Path = join(pagesDir, '404.js')
  const documentPath = join(pagesDir, '_document.js')
  
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true })
  }
  
  if (!fs.existsSync(custom404Path)) {
    const simple404Content = `
function Custom404() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Return to Home</a>
    </div>
  )
}

export default Custom404
`
    fs.writeFileSync(custom404Path, simple404Content.trim())
    console.log(`Created custom 404 page at ${custom404Path}`)
  }
  
  if (!fs.existsSync(documentPath)) {
    const documentContent = `
import { Html, Head, Main, NextScript } from 'next/document'

function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
`
    fs.writeFileSync(documentPath, documentContent.trim())
    console.log(`Created custom _document page at ${documentPath}`)
  }
}

function runNextCommand(command, options = {}) {
  const userCwd = process.cwd()
  const mdxRoot = join(__dirname, '..')
  const embeddedAppPath = join(mdxRoot, 'src')
  
  if (command === 'build') {
    ensureCustom404Page(userCwd)
  }
  
  const localNextBin = join(userCwd, 'node_modules', '.bin', 'next')
  const mdxeNextBin = join(mdxRoot, 'node_modules', '.bin', 'next')
  
  let nextCommand
  if (fs.existsSync(localNextBin)) {
    nextCommand = localNextBin
  } else if (fs.existsSync(mdxeNextBin)) {
    nextCommand = mdxeNextBin
  } else {
    nextCommand = 'npx next'
  }
  
  const args = [command]
  
  if (options.port) {
    args.push('-p', options.port)
  }
  
  if (options.hostname) {
    args.push('-H', options.hostname)
  }
  
  console.log(`Running Next.js command: ${nextCommand} ${args.join(' ')}`)
  console.log(`User current directory: ${userCwd}`)
  console.log(`App directory: ${embeddedAppPath}`)
  
  const readmePath = join(userCwd, 'README.md')
  const hasReadme = fs.existsSync(readmePath)
  
  const env = {
    ...process.env,
    NEXT_PUBLIC_USER_CWD: userCwd,
    USER_CWD: userCwd,
    APP_ROOT_PATH: embeddedAppPath,
    README_PATH: hasReadme ? readmePath : '',
    NODE_ENV: command === 'build' ? 'production' : 'development'
  }
  
  activeProcess = spawn(nextCommand, args, {
    stdio: 'inherit',
    shell: true,
    cwd: embeddedAppPath,
    env
  })
  
  return new Promise((resolve, reject) => {
    activeProcess.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Next.js process exited with code ${code}`))
      }
    })
  })
}

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-H, --hostname <hostname>', 'Hostname to run on', 'localhost')
  .action(async (options) => {
    await runNextCommand('dev', options)
  })

program
  .command('build')
  .description('Build for production')
  .action(async () => {
    await runNextCommand('build')
  })

program
  .command('start')
  .description('Start production server')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-H, --hostname <hostname>', 'Hostname to run on', 'localhost')
  .action(async (options) => {
    await runNextCommand('start', options)
  })

if (!process.argv.slice(2).some(arg => ['dev', 'build', 'start'].includes(arg))) {
  program
    .argument('[path]', 'Path to a markdown file or directory', '.')
    .action(async (path) => {
      console.log(`Serving markdown content from: ${path || '.'}`)
      await runNextCommand('dev')
    })
}

program.parse(process.argv)
