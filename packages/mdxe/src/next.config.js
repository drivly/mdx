/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  experimental: {
    appDir: true,
    pagesDir: false,
  },
  pageExtensions: ['tsx', 'jsx', 'js', 'ts'],
}

export default nextConfig
