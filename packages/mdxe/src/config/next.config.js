/**
 * @type {import('next').NextConfig}
 */

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.IS_VERCEL === 'true'

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        'next-mdx-import-source-file': './mdx-components.js',
      },
    },
  },
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
}

module.exports = nextConfig
