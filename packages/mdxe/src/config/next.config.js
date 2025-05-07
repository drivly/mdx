import nextra from 'nextra'

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withNextra({
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        'next-mdx-import-source-file': './mdx-components.js'
      }
    }
  }
})
