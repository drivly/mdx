

export interface BaseType {
  id?: string
  name?: string
  description?: string
  [key: string]: any
}

export interface Thing extends BaseType {
  $type?: 'Thing'
}

export const types = {
  Thing: 'Thing' as const,
}
