#!/usr/bin/env node

import { Command } from 'commander'
import { spawn } from 'child_process'
import { join, dirname } from 'path'
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

function runNextCommand(command, options = {}) {
  const userCwd = process.cwd()
  const mdxRoot = join(__dirname, '..')
  const embeddedAppPath = join(mdxRoot, 'src')
  
  const nextBin = join(process.cwd(), 'node_modules', '.bin', 'next')
  const nextBinExists = fs.existsSync(nextBin)
  
  const args = [command]
  
  if (options.port) {
    args.push('-p', options.port)
  }
  
  if (options.hostname) {
    args.push('-H', options.hostname)
  }
  
  const nextCommand = nextBinExists ? nextBin : 'next'
  
  console.log(`Running: ${nextCommand} ${args.join(' ')}`)
  
  activeProcess = spawn(nextCommand, args, {
    stdio: 'inherit',
    shell: true,
    cwd: embeddedAppPath,
    env: {
      ...process.env,
      USER_CWD: userCwd
    }
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
