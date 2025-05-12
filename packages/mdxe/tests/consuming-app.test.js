import { describe, beforeAll, afterAll, beforeEach, test, expect, vi } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { join, resolve } from 'path'
import { createServer } from 'http'
import { spawn } from 'child_process'
import { fetch } from 'undici'
import { tmpdir } from 'os'

describe('mdxe in consuming application', () => {
  const REPO_ROOT = resolve(__dirname, '..', '..', '..')
  const MDXE_DIR = resolve(__dirname, '..')
  const TEST_APP_DIR = resolve(__dirname, 'fixtures', 'minimal-app')
  const TEST_TEMP_DIR = resolve(__dirname, 'temp')
  
  const CONFIG_FILES = [
    'next.config.js',
    'tailwind.config.js',
    'mdx-components.js'
  ]
  
  let devServer
  let devServerUrl
  let testAppNodeModules
  
  beforeAll(async () => {
    console.log('Setting up test environment...')
    
    if (existsSync(TEST_TEMP_DIR)) {
      rmSync(TEST_TEMP_DIR, { recursive: true, force: true })
    }
    
    mkdirSync(TEST_TEMP_DIR, { recursive: true })
    
    console.log('Building mdxe package...')
    execSync('pnpm build', { cwd: MDXE_DIR, stdio: 'inherit' })
    
    console.log('Setting up test app...')
    execSync(`cp -r ${TEST_APP_DIR}/* ${TEST_TEMP_DIR}`, { stdio: 'inherit' })
    
    writeFileSync(
      join(TEST_TEMP_DIR, 'README.md'),
      '# Test App\n\n## Heading 2\n\nThis is a **bold** and *italic* text.\n\n- List item 1\n- List item 2\n- List item 3\n'
    )
    
    console.log('Installing local mdxe package into test app...')
    writeFileSync(
      join(TEST_TEMP_DIR, 'package.json'),
      JSON.stringify({
        ...JSON.parse(readFileSync(join(TEST_APP_DIR, 'package.json'), 'utf-8')),
        dependencies: {
          mdxe: `file:${MDXE_DIR}`
        }
      }, null, 2)
    )
    
    execSync('pnpm install', { cwd: TEST_TEMP_DIR, stdio: 'inherit' })
    
    testAppNodeModules = join(TEST_TEMP_DIR, 'node_modules', 'mdxe')
  }, 60000) // Increased timeout for setup
  
  test('mdxe package includes necessary configuration files', () => {
    console.log('Checking if configuration files exist in mdxe package')
    
    const configDir = join(MDXE_DIR, 'src', 'config')
    
    for (const configFile of CONFIG_FILES) {
      const configPath = join(configDir, configFile)
      console.log(`Checking if config file exists: ${configPath}`)
      expect(existsSync(configPath)).toBe(true)
    }
    
    const tempConfigPath = join(MDXE_DIR, 'src', 'utils', 'temp-config.js')
    console.log(`Checking if temp-config.js exists: ${tempConfigPath}`)
    expect(existsSync(tempConfigPath)).toBe(true)
  })
  
  test('mdxe CLI uses temp-config.js utility', () => {
    console.log('Checking if mdxe CLI uses temp-config.js utility')
    
    const mdxeScriptPath = join(MDXE_DIR, 'bin', 'mdxe.js')
    console.log(`Reading mdxe CLI script from: ${mdxeScriptPath}`)
    
    const mdxeScript = readFileSync(mdxeScriptPath, 'utf8')
    expect(mdxeScript).toContain('createTempNextConfig')
    expect(mdxeScript).toContain('import { createTempNextConfig } from')
    
    console.log('Verified mdxe CLI uses temp-config.js utility')
  })
  
  test('mdxe dev command uses runtime Next.js configuration', async () => {
    console.log('Testing mdxe dev command with runtime Next.js configuration')
    
    devServer = spawn('npx', ['mdxe', 'dev'], { 
      cwd: TEST_TEMP_DIR,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: `${join(TEST_TEMP_DIR, 'node_modules', '.bin')}:${process.env.PATH}`
      }
    })
    
    let output = ''
    const serverStarted = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 30000) // 30s timeout
      
      devServer.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        console.log(chunk)
        
        if (chunk.includes('- Local:') || chunk.includes('ready - started')) {
          clearTimeout(timeout)
          resolve(true)
        }
      })
      
      devServer.stderr.on('data', (data) => {
        console.error(data.toString())
      })
    })
    
    expect(serverStarted).toBe(true)
    
    const localUrlMatch = output.match(/- Local:\s+(https?:\/\/[^\s]+)/i) || 
                          output.match(/ready - started server on\s+(https?:\/\/[^\s]+)/i)
    
    if (localUrlMatch) {
      devServerUrl = localUrlMatch[1]
    } else {
      devServerUrl = 'http://localhost:3000' // Default
    }
    
    expect(output).not.toContain('Couldn\'t find any `pages` or `app` directory')
    expect(output).not.toContain('No Next.js config found')
  }, 60000) // Increased timeout for server startup
  
  test('no config files created in consuming app root', () => {
    console.log('Checking for config files in test app root')
    
    for (const configFile of CONFIG_FILES) {
      const configPath = join(TEST_TEMP_DIR, configFile)
      const configExists = existsSync(configPath)
      console.log(`Config file ${configFile}: ${configExists ? 'exists' : 'does not exist'}`)
      expect(configExists).toBe(false)
    }
  })
  
  test.skip('markdown files are properly rendered', async () => {
    console.log('Testing markdown rendering')
    
    if (!devServerUrl) {
      throw new Error('Dev server URL not available')
    }
    
    const response = await fetch(devServerUrl)
    expect(response.status).toBe(200)
    
    const html = await response.text()
    
    expect(html).toContain('Test App')
    expect(html).toContain('Heading 2')
    expect(html).toContain('List item 1')
    expect(html).toContain('List item 2')
    expect(html).toContain('List item 3')
    
    expect(html).toMatch(/<h1[^>]*>Test App<\/h1>/i)
    expect(html).toMatch(/<h2[^>]*>Heading 2<\/h2>/i)
    expect(html).toMatch(/<strong>bold<\/strong>/i)
    expect(html).toMatch(/<em>italic<\/em>/i)
    expect(html).toMatch(/<li>List item \d<\/li>/i)
  }, 30000) // Increased timeout for rendering test
  
  afterAll(async () => {
    console.log('Running afterAll cleanup')
    
    if (devServer) {
      console.log('Shutting down dev server')
      devServer.kill()
    }
    
    if (existsSync(TEST_TEMP_DIR)) {
      console.log(`Cleaning up test directory: ${TEST_TEMP_DIR}`)
      try {
        rmSync(TEST_TEMP_DIR, { recursive: true, force: true })
        console.log('Test directory cleaned up successfully')
      } catch (error) {
        console.warn(`Error cleaning up test directory: ${error.message}`)
      }
    }
    
    console.log('Cleanup complete')
  })
})
