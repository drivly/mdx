import { createProxy } from './proxy'
import { MDXFileSystemHandler } from './fs-handler'
import { PayloadHandler } from './payload-handler'
import { MDXDBOptions, MDXDBProxy } from './types'
import { createCollectionHandler } from './collection-handler'
import { DatabaseClient } from './database-do-types'

/**
 * Creates a database client for MDX files
 * @param options Database options
 * @returns Database client
 */
export const DB = (options: MDXDBOptions = {}): DatabaseClient => {
  const {
    backend = 'filesystem',
    basePath = '.db',
    fileExtension = '.mdx',
    createDirectories = true,
    payload
  } = options

  const handler = backend === 'filesystem'
    ? new MDXFileSystemHandler(basePath, fileExtension, createDirectories)
    : new PayloadHandler(payload)

  return new Proxy({} as DatabaseClient, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop !== 'then') {
        return createCollectionHandler(handler, prop)
      }
      return target[prop as keyof typeof target]
    },
  })
}

export const db = createProxy(new MDXFileSystemHandler())

export * from './types'
export * from './database-do-types'
