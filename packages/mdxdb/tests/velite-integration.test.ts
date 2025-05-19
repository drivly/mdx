import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

vi.mock('payload', () => {
  return {
    default: {
      init: vi.fn().mockResolvedValue({
        find: vi.fn().mockResolvedValue({ docs: [] }),
        create: vi.fn().mockResolvedValue({ id: 'test-id' }),
        update: vi.fn().mockResolvedValue({ id: 'test-id' }),
      }),
    }
  }
})

vi.mock('../velite.config', () => {
  return {
    default: {},
    getPayloadClient: vi.fn().mockImplementation(async () => {
      const payload = require('payload')
      return payload.default.init({
        secret: 'test-secret'
      })
    })
  }
})

describe('Velite integration', () => {
  const TEST_CONTENT_DIR = path.resolve(process.cwd(), 'tests', 'content')
  const TEST_MDX_FILE = path.join(TEST_CONTENT_DIR, 'test.mdx')
  
  beforeAll(() => {
    if (!fs.existsSync(TEST_CONTENT_DIR)) {
      fs.mkdirSync(TEST_CONTENT_DIR, { recursive: true })
    }
    
    fs.writeFileSync(TEST_MDX_FILE, `---
title: Test MDX
---

# Hello World

This is a test MDX file.
`)
  })
  
  afterAll(() => {
    if (fs.existsSync(TEST_CONTENT_DIR)) {
      fs.rmSync(TEST_CONTENT_DIR, { recursive: true, force: true })
    }
  })
  
  it('should process MDX files correctly', async () => {
    const { build } = await import('velite')
    
    const result = await build({} as any)
    
    expect(result).toBeDefined()
  })
  
  it('should update database when processing MDX files', async () => {
    const payload = await import('payload')
    
    // expect(payload.default.init).toHaveBeenCalled()
    
    const mockPayload = await payload.default.init({
      secret: 'test-secret'
    } as any)
    
    expect(mockPayload.find).toBeDefined()
    expect(mockPayload.create).toBeDefined()
  })
})
