import nextra from 'nextra'

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
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.js'
    }
  }
})
