export const version = '0.1.0'

// @ts-ignore
export { useMDXComponents } from './config/mdx-components.js'

export { types } from './config/types.js'

export const getDefaultConfigs = async () => {
  // @ts-ignore
  const [nextConfig, tailwindConfig] = await Promise.all([
    import('./config/next.config.js'),
    import('./config/tailwind.config.js')
  ])
  
  return {
    nextConfig: nextConfig.default,
    tailwindConfig: tailwindConfig.default
  }
}

// @ts-ignore
export {
  isDirectory,
  isMarkdownFile,
  findIndexFile,
  resolvePath,
  getAllMarkdownFiles,
  filePathToRoutePath
} from './utils/file-resolution.js'
