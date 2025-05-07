import nextra from 'nextra'
import { join } from 'path'

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withNextra({
  reactStrictMode: true,
  swcMinify: true,
  postcssOptions: {
    plugins: {
      tailwindcss: { config: process.env.TAILWIND_CONFIG_PATH },
      autoprefixer: {},
    },
  },
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': process.env.MDX_COMPONENTS_PATH || './mdx-components.js'
    }
  }
})
