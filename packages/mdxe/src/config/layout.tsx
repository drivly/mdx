import React from 'react'
import type { ReactNode } from 'react'
import { types } from './types.js'

export interface LayoutComponent {
  component: (props: { children: ReactNode; data: any }) => React.ReactElement
  matches: (data: any) => boolean
}

export const layouts: LayoutComponent[] = [
  {
    component: ({ children, data }) => {
      return (
        <div className='mdxe-thing'>
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
          <div className='prose prose-lg max-w-none'>{children}</div>
        </div>
      )
    },
    matches: (data) => !data.$type || data.$type === types.Thing,
  },
]
