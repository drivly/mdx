import React from 'react'
import type { ComponentType } from 'react'

type MDXComponents = Record<string, ComponentType<any>>

const layouts = {
  ArticleLayout: ({ children }: { children: React.ReactNode }) => <div className="article-layout">{children}</div>,
  PostLayout: ({ children }: { children: React.ReactNode }) => <div className="post-layout">{children}</div>,
  DocsLayout: ({ children }: { children: React.ReactNode }) => <div className="docs-layout">{children}</div>,
  ThingLayout: ({ children }: { children: React.ReactNode }) => <div className="thing-layout">{children}</div>,
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  let userComponents = {}
  try {
    const userMdxComponents = require(process.cwd() + '/mdx-components.js')
    if (userMdxComponents.default) {
      userComponents = userMdxComponents.default
    } else if (typeof userMdxComponents === 'function') {
      userComponents = userMdxComponents(components)
    } else if (typeof userMdxComponents === 'object') {
      userComponents = userMdxComponents
    }
  } catch (e) {
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
