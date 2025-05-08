import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { tmpdir } from 'os'
import fs from 'fs/promises'

describe('mdxe package Next.js configuration', () => {
  test('mdxe package includes necessary Next.js configuration files', () => {
    const MDXE_DIR = resolve(__dirname, '..')
    const configDir = join(MDXE_DIR, 'src', 'config')
    
    const requiredFiles = [
      'next.config.js',
      'tailwind.config.js',
      'mdx-components.js'
    ]
    
    for (const file of requiredFiles) {
      const filePath = join(configDir, file)
      console.log(`Checking if config file exists: ${filePath}`)
      expect(existsSync(filePath)).toBe(true)
    }
    
    const tempConfigPath = join(MDXE_DIR, 'src', 'utils', 'temp-config.js')
    expect(existsSync(tempConfigPath)).toBe(true)
  })
})
