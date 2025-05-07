import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import * as mdxui from 'mdxui'

const layouts = [
  {
    component: ({ children, data }) => {
      const frontmatter = Object.keys(data).length > 0 ? (
        <dl className="mdxe-frontmatter mb-8 p-4 bg-gray-50 rounded-md">
          {Object.entries(data)
            .filter(([key]) => !key.startsWith('$') && key !== 'children')
            .map(([key, value]) => (
              <div key={key} className="mb-2">
                <dt className="font-semibold">{key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
        </dl>
      ) : null;
      
      return (
        <div className="mdxe-thing">
          {frontmatter}
          <div className="prose prose-lg max-w-none">{children}</div>
        </div>
      );
    },
    matches: (data) => !data.$type || data.$type === 'Thing'
  }
]

const themeComponents = getThemeComponents()

const TypeBasedWrapper = ({ children, ...props }) => {
  const data = props.metadata || {}
  
  const layout = layouts.find(l => l.matches(data))
  
  if (layout) {
    return layout.component({ children, data })
  }
  
  if (themeComponents.wrapper) {
    return themeComponents.wrapper({ children, ...props })
  }
  
  return <>{children}</>
}

export function useMDXComponents(components) {
  return {
    ...themeComponents,
    ...mdxui,
    wrapper: TypeBasedWrapper,
    ...components,
  }
}
