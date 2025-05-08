import React from 'react'
import type { ReactNode } from 'react'

export interface BaseType {
  id?: string
  name?: string
  description?: string
  [key: string]: any
}

export interface Thing extends BaseType {
  $type?: 'Thing'
}

export interface LayoutComponent {
  component: (props: { children: ReactNode; data: any }) => React.ReactElement
  matches: (data: any) => boolean
}

export const types = {
  Thing: 'Thing' as const,
}

export const layouts: LayoutComponent[] = [
  {
    component: ({ children, data }) => {
      return (
        <div className='mdxe-thing'>
          {/* Description list for frontmatter at top */}
          {Object.keys(data).length > 0 && (
            <dl className='mdxe-frontmatter mb-8 p-4 bg-gray-50 rounded-md'>
              {Object.entries(data)
                .filter(([key]) => !key.startsWith('$') && key !== 'children')
                .map(([key, value]) => (
                  <div key={key} className='mb-2'>
                    <dt className='font-semibold'>{key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
            </dl>
          )}
          {/* Standard markdown rendering with Tailwind Typography */}
          <div className='prose prose-lg max-w-none'>{children}</div>
        </div>
      )
    },
    matches: (data) => !data.$type || data.$type === types.Thing,
  },
]
