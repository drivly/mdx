/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.js',
    },
  },
  distDir: '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  useFileSystemPublicRoutes: true,
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true
}

module.exports = nextConfig
