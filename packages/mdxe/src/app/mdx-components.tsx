import React from 'react'
import type { ComponentType } from 'react'

type MDXComponents = Record<string, ComponentType<any>>

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const defaultComponents = {
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-bold">{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-bold">{children}</h3>,
    p: ({ children }: { children: React.ReactNode }) => <p className="my-2">{children}</p>,
    a: ({ children, href }: { children: React.ReactNode, href?: string }) => <a href={href} className="text-blue-500 hover:underline">{children}</a>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
    li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  }

  return {
    ...defaultComponents,
    ...components,
  }
}
