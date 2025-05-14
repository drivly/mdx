import React from 'react'
import type { ComponentType, ReactNode } from 'react'

interface MDXComponentProps {
  children: ReactNode  // Changed from optional to required
  [key: string]: any
}

type MDXComponents = Record<string, ComponentType<MDXComponentProps>>

const layouts = {
  ArticleLayout: ({ children }: MDXComponentProps) => <div className="article-layout">{children}</div>,
  PostLayout: ({ children }: MDXComponentProps) => <div className="post-layout">{children}</div>,
  DocsLayout: ({ children }: MDXComponentProps) => <div className="docs-layout">{children}</div>,
  ThingLayout: ({ children }: MDXComponentProps) => <div className="thing-layout">{children}</div>,
}

export async function useMDXComponents(components: MDXComponents): Promise<MDXComponents> {
  let userComponents = {}
  try {
    const userMdxComponentsModule = await import(process.cwd() + '/mdx-components.js')
    const userMdxComponents = userMdxComponentsModule.default || userMdxComponentsModule
    
    if (typeof userMdxComponents === 'function') {
      userComponents = userMdxComponents(components)
    } else if (typeof userMdxComponents === 'object') {
      userComponents = userMdxComponents
    }
  } catch (error) {
  }

  const defaultComponents = {
    h1: ({ children }: MDXComponentProps) => <h1 className="text-2xl font-bold">{children}</h1>,
    h2: ({ children }: MDXComponentProps) => <h2 className="text-xl font-bold">{children}</h2>,
    p: ({ children }: MDXComponentProps) => <p className="my-2">{children}</p>,
  }

  return {
    ...defaultComponents,
    ...layouts,
    ...userComponents,
    ...components,
  }
}
