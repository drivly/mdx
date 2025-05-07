#!/usr/bin/env node

/* global process */

import { Command } from 'commander'
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { 
  isDirectory, 
  isMarkdownFile, 
  findIndexFile, 
  resolvePath, 
  getAllMarkdownFiles, 
  filePathToRoutePath 
} from '../src/utils/file-resolution.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJsonPath = join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync(packageJsonPath, 'utf8')))
const version = packageJson.version

const program = new Command()

program
  .name('mdxe')
  .description('Zero-config CLI for serving Markdown and MDX files')
  .version(version)

const findConfigFile = (dir, filename) => {
  const configPath = join(dir, filename)
  return existsSync(configPath) ? configPath : null
}

const runNextCommand = async (command, args = []) => {
  const userCwd = process.cwd()
  const mdxeDir = join(__dirname, '..')
  
  try {
    const nextBin = resolve(userCwd, 'node_modules', '.bin', 'next')
    const nextExists = existsSync(nextBin)

    const configFiles = [
      { src: '../src/config/next.config.js', dest: 'next.config.js' },
      { src: '../src/config/tailwind.config.js', dest: 'tailwind.config.js' },
      { src: '../src/config/mdx-components.js', dest: 'mdx-components.js' }
    ]
    
    const fs = await import('fs/promises')
    
    for (const { src, dest } of configFiles) {
      const sourcePath = join(__dirname, src)
      const destPath = join(mdxeDir, dest)
      
      if (!existsSync(destPath)) {
        await fs.copyFile(sourcePath, destPath)
      }
    }
    
    process.env.USER_PROJECT_DIR = userCwd
    
    process.chdir(mdxeDir)
    
    const binPath = nextExists ? nextBin : 'npx next'
    const cmd = nextExists ? binPath : 'npx'
    const cmdArgs = nextExists ? [command, ...args] : ['next', command, ...args]
    
    const child = spawn(cmd, cmdArgs, { 
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    })
    
    child.on('error', (error) => {
      process.chdir(userCwd)
      console.error(`Error executing command: ${error.message}`)
      process.exit(1)
    })
    
    child.on('close', (code) => {
      process.chdir(userCwd)
      process.exit(code)
    })
  } catch (error) {
    process.chdir(userCwd)
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

program
  .argument('[path]', 'Path to a markdown file or directory', '.')
  .action(async (path) => {
    const resolvedPath = resolvePath(path)
    
    if (!resolvedPath) {
      console.error(`Error: Could not resolve path ${path} to a markdown file or directory with index file`)
      console.error('Make sure the path exists and is either:')
      console.error('  - A .md or .mdx file')
      console.error('  - A directory containing index.md, index.mdx, page.md, page.mdx, or README.md')
      process.exit(1)
    }
    
    console.log(`Serving markdown file: ${resolvedPath}`)
    
    await runNextCommand('dev')
  })

program.parse(process.argv)
