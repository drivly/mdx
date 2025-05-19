import React from 'react'
import type { ComponentType, PropsWithChildren } from 'react'
import path from 'path'
import { pathToFileURL } from 'url'

// Each MDX component receives arbitrary props plus children
type MDXComponentProps = PropsWithChildren<Record<string, unknown>>
type MDXComponent = ComponentType<MDXComponentProps>
type MDXComponents = Record<string, MDXComponent>

type UserMDXModule = { default?: MDXComponents | ((components: MDXComponents) => MDXComponents) } & Record<string, unknown>

const layouts = {
  ArticleLayout: ({ children }: { children: React.ReactNode }) => <div className="article-layout">{children}</div>,
  PostLayout: ({ children }: { children: React.ReactNode }) => <div className="post-layout">{children}</div>,
  DocsLayout: ({ children }: { children: React.ReactNode }) => <div className="docs-layout">{children}</div>,
  ThingLayout: ({ children }: { children: React.ReactNode }) => <div className="thing-layout">{children}</div>,
}

export async function useMDXComponents(components: MDXComponents): Promise<MDXComponents> {
  let userComponents: MDXComponents = {}
  try {
    const file = pathToFileURL(path.join(process.cwd(), 'mdx-components.js')).href
    const mod = (await import(file)) as UserMDXModule
    const pkg = mod.default ?? (mod as MDXComponents | ((components: MDXComponents) => MDXComponents))
    if (typeof pkg === 'function') {
      userComponents = pkg(components)
    } else if (typeof pkg === 'object') {
      userComponents = pkg
    }
  } catch (e) {
    console.error('Error loading MDX components:', e)
  }

  const defaultComponents = {
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-bold">{children}</h2>,
    p: ({ children }: { children: React.ReactNode }) => <p className="my-2">{children}</p>,
  }

  return {
    ...defaultComponents,
    ...layouts,
    ...userComponents,
    ...components,
  }
}
