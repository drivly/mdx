declare module '*.js'

declare module 'mdxui' {
  import { ComponentType } from 'react'
  export const Button: ComponentType<any>
  export const Card: ComponentType<any>
  export const Code: ComponentType<any>
}
