export interface MDXData {
  [key: string]: any
}

export interface MDXListItem extends MDXData {
  id: string
}

export interface MDXDBMethods {
  set: (id: string, data: MDXData) => Promise<MDXData>
  get: (id: string) => Promise<MDXData | null>
  list: () => Promise<MDXListItem[]>
}

export interface ProxyTarget {
  _path: string[]
}

export type MDXDBProxy = {
  [key: string]: MDXDBProxy & MDXDBMethods
} & MDXDBMethods

/**
 * Options for MDX database configuration
 */
export interface MDXDBOptions {
  /**
   * Database backend to use
   * @default 'filesystem'
   */
  backend?: 'filesystem' | 'payload'
  
  /**
   * Base path for MDX files (filesystem backend only)
   * @default '.db'
   */
  basePath?: string
  
  /**
   * File extension for MDX files (filesystem backend only)
   * @default '.mdx'
   */
  fileExtension?: string
  
  /**
   * Whether to create directories if they don't exist (filesystem backend only)
   * @default true
   */
  createDirectories?: boolean
  
  /**
   * Payload CMS instance (payload backend only)
   */
  payload?: any
}
