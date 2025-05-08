import { describe, it, expect } from 'vitest'
import { validateStructuredData, validateContent, validateExecutableCode, validateUIComponents } from './validators.js'

describe('validators', () => {
  describe('validateStructuredData', () => {
    it('should validate valid structured data', () => {
      const data = {
        title: 'Test Document',
        description: 'A test document',
      }
      expect(validateStructuredData(data)).toBe(true)
    })

    it('should invalidate non-object data', () => {
      expect(validateStructuredData(null as any)).toBe(false)
      expect(validateStructuredData([] as any)).toBe(false)
      expect(validateStructuredData('string' as any)).toBe(false)
      expect(validateStructuredData(123 as any)).toBe(false)
    })
  })

  describe('validateContent', () => {
    it('should validate valid content', () => {
      const content = '# Test Document\n\nThis is a test document.'
      expect(validateContent(content)).toBe(true)
    })

    it('should invalidate non-string content', () => {
      expect(validateContent(null as any)).toBe(false)
      expect(validateContent({} as any)).toBe(false)
      expect(validateContent([] as any)).toBe(false)
      expect(validateContent(123 as any)).toBe(false)
    })
  })

  describe('validateExecutableCode', () => {
    it('should validate valid executable code array', () => {
      const code = ["import { Button } from 'ui'", 'function example() { return "Hello" }']
      expect(validateExecutableCode(code)).toBe(true)
    })

    it('should validate valid executable code object', () => {
      const code = {
        imports: "import { Button } from 'ui'",
        functions: 'function example() { return "Hello" }',
      }
      expect(validateExecutableCode(code)).toBe(true)
    })

    it('should invalidate non-array/object code', () => {
      expect(validateExecutableCode(null as any)).toBe(false)
      expect(validateExecutableCode('string' as any)).toBe(false)
      expect(validateExecutableCode(123 as any)).toBe(false)
    })

    it('should invalidate array with non-string items', () => {
      const code = ['valid', 123, {}] as any
      expect(validateExecutableCode(code)).toBe(false)
    })

    it('should invalidate object with non-string values', () => {
      const code = { valid: 'string', invalid: 123 } as any
      expect(validateExecutableCode(code)).toBe(false)
    })
  })

  describe('validateUIComponents', () => {
    it('should validate valid UI components array', () => {
      const components = ['<Button>Click me</Button>', '<Card><CardTitle>Title</CardTitle></Card>']
      expect(validateUIComponents(components)).toBe(true)
    })

    it('should validate valid UI components object', () => {
      const components = {
        button: '<Button>Click me</Button>',
        card: '<Card><CardTitle>Title</CardTitle></Card>',
      }
      expect(validateUIComponents(components)).toBe(true)
    })

    it('should invalidate non-array/object components', () => {
      expect(validateUIComponents(null as any)).toBe(false)
      expect(validateUIComponents('string' as any)).toBe(false)
      expect(validateUIComponents(123 as any)).toBe(false)
    })

    it('should invalidate array with non-string items', () => {
      const components = ['<Button>Valid</Button>', 123, {}] as any
      expect(validateUIComponents(components)).toBe(false)
    })

    it('should invalidate object with non-string values', () => {
      const components = { valid: '<Button>Valid</Button>', invalid: 123 } as any
      expect(validateUIComponents(components)).toBe(false)
    })
  })
})
