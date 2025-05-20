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
  const nextConfigPath = join(userCwd, 'next.config.js')
  
  if (!fs.existsSync(nextConfigPath)) {
    const nextConfigContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    disableOptimizedLoading: true,
    optimizeCss: false
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
`
    fs.writeFileSync(nextConfigPath, nextConfigContent.trim())
    console.log(`Created Next.js config at ${nextConfigPath}`)
  } else {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf-8')
    
    if (!nextConfig.includes('disableOptimizedLoading')) {
      nextConfig = nextConfig.replace(
        'const nextConfig = {',
        `const nextConfig = {
  experimental: {
    disableOptimizedLoading: true,
    optimizeCss: false
  },`
      )
      
      fs.writeFileSync(nextConfigPath, nextConfig)
      console.log(`Updated Next.js config at ${nextConfigPath}`)
    }
  }
  
  const pagesDir = join(userCwd, 'pages')
  if (fs.existsSync(pagesDir)) {
    const custom404Path = join(pagesDir, '404.js')
    if (fs.existsSync(custom404Path)) {
      fs.unlinkSync(custom404Path)
      console.log(`Removed custom 404 page at ${custom404Path}`)
    }
  }
}

function runNextCommand(command, options = {}) {
  const userCwd = process.cwd()
  const mdxRoot = join(__dirname, '..')
  const embeddedAppPath = join(mdxRoot, 'src')
  
  if (command === 'build') {
    const nextConfigPath = join(userCwd, 'next.config.js')
    const nextConfigContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
`
    fs.writeFileSync(nextConfigPath, nextConfigContent.trim())
    console.log(`Created Next.js config at ${nextConfigPath}`)
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
    NODE_ENV: command === 'build' ? 'production' : 'development',
    NEXT_SKIP_404: 'true'
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
