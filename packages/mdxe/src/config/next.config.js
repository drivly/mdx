/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        'next-mdx-import-source-file': './mdx-components.js',
      },
    },
    appDir: true,
  },
  distDir: '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
}

module.exports = nextConfig
