import { describe, beforeAll, afterAll, beforeEach, test, expect, vi } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { join, resolve } from 'path'
import { createServer } from 'http'
import { spawn } from 'child_process'
import { fetch } from 'undici'

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
    if (existsSync(TEST_TEMP_DIR)) {
      rmSync(TEST_TEMP_DIR, { recursive: true, force: true })
    }
    
    mkdirSync(TEST_TEMP_DIR, { recursive: true })
    
    console.log('Building mdxe package...')
    execSync('pnpm build', { cwd: MDXE_DIR, stdio: 'inherit' })
    
    console.log('Setting up test app...')
    execSync(`cp -r ${TEST_APP_DIR}/* ${TEST_TEMP_DIR}`, { stdio: 'inherit' })
    
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
  })
  
  test('mdxe package includes .next directory', () => {
    const nextDirExists = existsSync(join(testAppNodeModules, '.next'))
    expect(nextDirExists).toBe(true)
  })
  
  test('mdxe dev command uses packaged Next.js app', async () => {
    devServer = spawn('pnpm', ['dev'], { 
      cwd: TEST_TEMP_DIR,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
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
  })
  
  test('no config files created in consuming app root', () => {
    for (const configFile of CONFIG_FILES) {
      const configExists = existsSync(join(TEST_TEMP_DIR, configFile))
      expect(configExists).toBe(false)
    }
  })
  
  test('markdown files are properly rendered', async () => {
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
  })
  
  afterAll(async () => {
    if (devServer) {
      devServer.kill()
    }
    
    if (existsSync(TEST_TEMP_DIR)) {
      rmSync(TEST_TEMP_DIR, { recursive: true, force: true })
    }
  })
})
