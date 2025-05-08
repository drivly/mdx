import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join, resolve } from 'path'

describe('mdxe package .next directory', () => {
  test('mdxe package includes .next directory after build', () => {
    console.log('Running simplified .next directory test')
    
    const MDXE_DIR = resolve(__dirname, '..')
    const packageNextDir = join(MDXE_DIR, '.next')
    
    console.log('Building mdxe package...')
    try {
      execSync('pnpm build', { cwd: MDXE_DIR, stdio: 'inherit' })
      console.log('Build completed successfully')
    } catch (error) {
      console.error('Build failed:', error.message)
      throw error
    }
    
    console.log('Checking if .next directory exists in package root:', packageNextDir)
    const packageNextDirExists = existsSync(packageNextDir)
    
    if (packageNextDirExists) {
      console.log('.next directory exists in package root')
      console.log('Contents:', execSync(`ls -la ${packageNextDir}`, { encoding: 'utf8' }))
    } else {
      console.error('.next directory does not exist in package root')
    }
    
    expect(packageNextDirExists).toBe(true)
  }, 120000) // Increase timeout to 120 seconds
})
