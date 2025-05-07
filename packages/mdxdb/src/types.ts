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
