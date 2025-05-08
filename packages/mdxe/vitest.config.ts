import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
})
