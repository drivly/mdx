#!/usr/bin/env node
import { CLI } from './cli.js'

const cli = new CLI()
const [command, ...args] = process.argv.slice(2)

async function run() {
  if (!command || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  try {
    switch (command) {
      case 'init':
        await cli.init()
        break
      case 'generate':
        if (!args[0]) {
          console.error('Error: Path is required for generate command')
          showHelp()
          process.exit(1)
        }
        await cli.generate(args[0], JSON.parse(args[1] || '{}'))
        break
      case 'edit':
        if (!args[0]) {
          console.error('Error: Path is required for edit command')
          showHelp()
          process.exit(1)
        }
        await cli.edit(args[0], JSON.parse(args[1] || '{}'))
        break
      case 'batch':
        if (!args[0]) {
          console.error('Error: Pattern is required for batch command')
          showHelp()
          process.exit(1)
        }
        await cli.batch(args[0], JSON.parse(args[1] || '{}'))
        break
      default:
        console.error(`Unknown command: ${command}`)
        showHelp()
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${errorMessage}`)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
  mdxai - CLI to recursively generate and edit MDX files using AI
  
  Commands:
    init                   Initialize configuration
    generate <path> [opts] Generate new MDX file(s)
    edit <path> [opts]     Edit existing MDX file(s)
    batch <pattern> [opts] Process multiple files
  `)
}

run()
