/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  output: 'standalone',
  transpilePackages: ['mdxe'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
