import { MDXData, MDXDBProxy, ProxyTarget } from './types'
import { MDXFileSystemHandler } from './fs-handler'
import { PayloadHandler } from './payload-handler'

/**
 * Creates a proxy object for MDX database operations
 * @param handler Database handler (filesystem or payload)
 * @param path Path segments
 * @returns Proxy object
 */
export function createProxy(handler: MDXFileSystemHandler | PayloadHandler, path: string[] = []): MDXDBProxy {
  const proxyHandler = {
    get(target: ProxyTarget, prop: string | symbol): any {
      if (prop === 'set') {
        return async (id: string, data: MDXData): Promise<MDXData> => {
          return handler.writeMDX([...target._path, id], data)
        }
      }

      if (prop === 'get') {
        return async (id: string) => {
          return handler.readMDX([...target._path, id])
        }
      }

      if (prop === 'list') {
        return async () => {
          return handler.listMDX(target._path)
        }
      }

      return createProxy(handler, [...target._path, String(prop)])
    },
  }

  return new Proxy({ _path: path }, proxyHandler) as unknown as MDXDBProxy
}
