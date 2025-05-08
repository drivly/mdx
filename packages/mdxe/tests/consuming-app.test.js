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
    
    writeFileSync(
      join(TEST_TEMP_DIR, '.npmrc'),
      'shamefully-hoist=true\nnode-linker=hoisted\n'
    )
    
    execSync('pnpm install', { cwd: TEST_TEMP_DIR, stdio: 'inherit' })
    
    execSync('chmod +x node_modules/.bin/mdxe', { cwd: TEST_TEMP_DIR, stdio: 'inherit' })
    
    testAppNodeModules = join(TEST_TEMP_DIR, 'node_modules', 'mdxe')
  }, 60000) // Increase timeout to 60 seconds
  
  test('mdxe package includes .next directory', () => {
    console.log('Checking if .next directory exists in:', testAppNodeModules)
    const nextDirExists = existsSync(join(testAppNodeModules, '.next'))
    
    if (!nextDirExists) {
      console.log('Contents of node_modules/mdxe:', execSync(`ls -la ${testAppNodeModules}`, { encoding: 'utf8' }))
    } else {
      console.log('.next directory found in node_modules/mdxe')
    }
    
    expect(nextDirExists).toBe(true)
  }, 30000) // Increase timeout to 30 seconds
  
  test('mdxe dev command uses packaged Next.js app', async () => {
    console.log('Starting mdxe dev command test')
    console.log('Test app directory:', TEST_TEMP_DIR)
    console.log('Contents of test app directory:', execSync(`ls -la ${TEST_TEMP_DIR}`, { encoding: 'utf8' }))
    
    devServer = spawn('pnpm', ['dev'], { 
      cwd: TEST_TEMP_DIR,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    
    console.log('Dev server process started')
    
    let output = ''
    const serverStarted = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('Timeout reached waiting for server to start')
        resolve(false)
      }, 60000) // 60s timeout
      
      devServer.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        console.log('Server output:', chunk)
        
        if (chunk.includes('- Local:') || chunk.includes('ready - started')) {
          console.log('Server started successfully')
          clearTimeout(timeout)
          resolve(true)
        }
      })
      
      devServer.stderr.on('data', (data) => {
        const errorChunk = data.toString()
        console.error('Server error:', errorChunk)
      })
      
      devServer.on('error', (error) => {
        console.error('Process error:', error.message)
      })
      
      devServer.on('close', (code) => {
        console.log(`Dev server process exited with code ${code}`)
        if (!serverStarted) {
          clearTimeout(timeout)
          resolve(false)
        }
      })
    })
    
    expect(serverStarted).toBe(true)
    
    const localUrlMatch = output.match(/- Local:\s+(https?:\/\/[^\s]+)/i) || 
                          output.match(/ready - started server on\s+(https?:\/\/[^\s]+)/i)
    
    if (localUrlMatch) {
      devServerUrl = localUrlMatch[1]
      console.log('Server URL:', devServerUrl)
    } else {
      console.log('Could not find server URL in output, using default')
      devServerUrl = 'http://localhost:3000' // Default
    }
    
    expect(output).not.toContain('Couldn\'t find any `pages` or `app` directory')
    expect(output).not.toContain('No Next.js config found')
  }, 90000) // Increase timeout to 90 seconds
  
  test.skip('no config files created in consuming app root', () => {
    console.log('Checking for config files in test app root')
    
    for (const configFile of CONFIG_FILES) {
      const configPath = join(TEST_TEMP_DIR, configFile)
      const configExists = existsSync(configPath)
      console.log(`Config file ${configFile}: ${configExists ? 'exists' : 'does not exist'}`)
      expect(configExists).toBe(false)
    }
  }, 30000) // Increase timeout to 30 seconds
  
  test.skip('markdown files are properly rendered', async () => {
    console.log('Testing markdown rendering')
    
    if (!devServerUrl) {
      console.error('Dev server URL not available')
      throw new Error('Dev server URL not available')
    }
    
    console.log('Fetching content from:', devServerUrl)
    
    try {
      const response = await fetch(devServerUrl)
      console.log('Response status:', response.status)
      
      const html = await response.text()
      console.log('Response HTML length:', html.length)
      
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
    } catch (error) {
      console.error('Error fetching content:', error.message)
      throw error
    }
  }, 60000) // Increase timeout to 60 seconds
  
  afterAll(async () => {
    if (devServer) {
      devServer.kill()
    }
    
    if (existsSync(TEST_TEMP_DIR)) {
      rmSync(TEST_TEMP_DIR, { recursive: true, force: true })
    }
  })
})
