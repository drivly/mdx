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

  try {
    tempConfigInfo = await createTempNextConfig(userCwd)
    console.log(`Using temporary Next.js configuration in ${tempConfigInfo.tempDir}`)
    
    const mdxeModulePath = resolve(__dirname, '..')
    
    const localNextBin = resolve(userCwd, 'node_modules', '.bin', 'next')
    const mdxeNextBin = resolve(mdxeModulePath, 'node_modules', '.bin', 'next')

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
    
    activeProcess = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: true,
      cwd: tempConfigInfo.tempDir,
      env: {
        ...process.env,
        MDXE_CONTENT_DIR: userCwd,
        MDXE_MODULE_PATH: mdxeModulePath,
        NODE_PATH: process.env.NODE_PATH ? 
          `${process.env.NODE_PATH}:${join(mdxeModulePath, 'node_modules')}` : 
          join(mdxeModulePath, 'node_modules')
      }
    })

    activeProcess.on('error', (error) => {
      console.error(`Error executing command: ${error.message}`)
      tempConfigInfo.cleanup().finally(() => process.exit(1))
    })

    activeProcess.on('close', (code) => {
      tempConfigInfo.cleanup().finally(() => process.exit(code))
    })
  } catch (error) {
    console.error(`Error: ${error.message}`)
    if (tempConfigInfo) {
      await tempConfigInfo.cleanup()
    }
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

program.argument('[path]', 'Path to a markdown file or directory', '.').action(async (path) => {
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
