#!/usr/bin/env node

/* global process */

import { Command } from 'commander'
import { existsSync } from 'fs'
import path, { join, resolve } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'
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

const runNextCommand = async (command, args = [], extraEnv = {}) => {
  const userCwd = process.cwd()
  const mdxeRoot = resolve(__dirname, '..')
  const embeddedAppPath = resolve(mdxeRoot, 'src')

  try {
    const readmePath = resolve(userCwd, 'README.md')
    const hasReadme = existsSync(readmePath)
    
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
    
    const isVercelDeployment = process.env.VERCEL === '1'
    
    let nextDistDir = resolve(userCwd, '.next')
    
    if (isVercelDeployment) {
      console.log('Vercel deployment detected. Ensuring .next directory is in project root.')
      // Always use userCwd (the actual project root) instead of process.cwd() 
      nextDistDir = resolve(userCwd, '.next')
    }
    
    activeProcess = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: true,
      cwd: embeddedAppPath,
      env: {
        ...process.env,
        PAYLOAD_DB_PATH: resolve(userCwd, 'mdx.db'),
        NEXT_DIST_DIR: nextDistDir,
        USER_CWD: userCwd,
        README_PATH: hasReadme ? readmePath : '',
        ...extraEnv
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

const mdxdbConfig = resolve(__dirname, '..', '..', 'mdxdb', 'src', 'payload.config.ts')
let payloadClient = null

const getPayloadClient = async () => {
  if (payloadClient) return payloadClient
  const payload = await import('payload')
  if (!payload.default.collections) {
    payloadClient = await payload.default.init({
      secret: process.env.PAYLOAD_SECRET || 'secret',
      local: true,
      config: mdxdbConfig
    })
  } else {
    payloadClient = payload.default
  }
  return payloadClient
}

const saveNotebook = async (filePath) => {
  const payload = await getPayloadClient()
  const content = await fs.readFile(filePath, 'utf8')
  const relative = path.relative(process.cwd(), filePath)
  const parts = relative.split(path.sep)
  const folder = parts.length > 1 ? parts[0] : 'root'
  const id = path.basename(filePath, path.extname(filePath))

  let folderId
  const folderRes = await payload.find({ collection: 'folders', where: { id: { equals: folder } } })
  if (folderRes.docs.length > 0) {
    folderId = folderRes.docs[0].id
  } else {
    const newFolder = await payload.create({ collection: 'folders', data: { id: folder } })
    folderId = newFolder.id
  }

  const docRes = await payload.find({ collection: 'mdx', where: { id: { equals: id }, folder: { equals: folderId } } })
  if (docRes.docs.length > 0) {
    await payload.update({ collection: 'mdx', id: docRes.docs[0].id, data: { content } })
    console.log('Notebook updated in Payload CMS')
  } else {
    await payload.create({ collection: 'mdx', data: { folder: folderId, id, content } })
    console.log('Notebook saved to Payload CMS')
  }
}

const loadNotebook = async (filePath) => {
  const payload = await getPayloadClient()
  const relative = path.relative(process.cwd(), filePath)
  const parts = relative.split(path.sep)
  const folder = parts.length > 1 ? parts[0] : 'root'
  const id = path.basename(filePath, path.extname(filePath))

  const folderRes = await payload.find({ collection: 'folders', where: { id: { equals: folder } } })
  if (!folderRes.docs[0]) {
    console.error('Folder not found in Payload CMS')
    return
  }
  const folderId = folderRes.docs[0].id

  const docRes = await payload.find({ collection: 'mdx', where: { id: { equals: id }, folder: { equals: folderId } } })
  if (!docRes.docs[0]) {
    console.error('Notebook not found in Payload CMS')
    return
  }
  await fs.writeFile(filePath, docRes.docs[0].content)
  console.log('Notebook loaded from Payload CMS')
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
  .command('notebook <file>')
  .description('Launch interactive notebook viewer')
  .option('--save', 'Save notebook to Payload CMS')
  .option('--load', 'Load notebook from Payload CMS')
  .action(async (file, options) => {
    const notebookPath = resolve(file)
    if (!existsSync(notebookPath)) {
      console.error(`Notebook file not found: ${notebookPath}`)
      process.exit(1)
    }

    if (options.load) {
      await loadNotebook(notebookPath)
    }

    if (options.save) {
      await saveNotebook(notebookPath)
    }

    await runNextCommand('dev', [], { NOTEBOOK_PATH: notebookPath })
  })

if (!process.argv.slice(2).some(arg => ['dev', 'build', 'start', 'lint', 'notebook'].includes(arg))) {
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
