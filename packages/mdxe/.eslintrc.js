module.exports = {
  extends: 'next/core-web-vitals',
  ignorePatterns: [
    '.next/**/*',
    'node_modules/**/*',
    'dist/**/*',
    'src/.next/**/*'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@next/next/no-html-link-for-pages': 'off'
  }
}
