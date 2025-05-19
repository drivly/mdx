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
  },
  useFileSystemPublicRoutes: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  pageExtensions: ['tsx', 'jsx', 'js', 'ts'],
  distDir: '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  }
}

module.exports = nextConfig
