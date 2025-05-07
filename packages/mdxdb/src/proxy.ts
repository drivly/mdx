import { writeMDX, readMDX, listMDX } from './fs'
import { MDXData, MDXDBProxy, ProxyTarget } from './types'

export function createProxy(path: string[] = []): MDXDBProxy {
  const handler = {
    get(target: ProxyTarget, prop: string | symbol): any {
      if (prop === 'set') {
        return async (id: string, data: MDXData): Promise<MDXData> => {
          return writeMDX([...target._path, id], data)
        }
      }
      
      if (prop === 'get') {
        return async (id: string) => {
          return readMDX([...target._path, id])
        }
      }
      
      if (prop === 'list') {
        return async () => {
          return listMDX(target._path)
        }
      }
      
      return createProxy([...target._path, String(prop)])
    }
  }

  return new Proxy({ _path: path }, handler) as unknown as MDXDBProxy
}
