module.exports = {
  extends: 'next/core-web-vitals',
  ignorePatterns: [
    '.next/**/*',
    'node_modules/**/*',
    'dist/**/*'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-expressions': 'off'
  }
}
