import { fileURLToPath } from 'url'
import path from 'path'
import withMDX from '@next/mdx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT || 'standalone',
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    domains: (process.env.NEXT_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|mdx)$/,
      include: [/node_modules/],
      type: 'javascript/auto',
      use: 'null-loader',
    })
    
    config.module.rules.push({
      test: /LICENSE$/,
      include: [/node_modules/],
      type: 'javascript/auto',
      use: 'null-loader',
    })
    
    config.module.rules.push({
      test: /\.(node|exe|dll|wasm)$/,
      use: 'file-loader',
      type: 'javascript/auto',
    })
    
    return config
  },
}

export default withMDX({
  extension: /\.mdx?$/,
})(nextConfig)
