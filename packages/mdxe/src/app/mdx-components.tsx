import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
    a: ({ href, children }) => {
      if (href?.startsWith('/')) {
        return <Link href={href} className="text-blue-600 dark:text-blue-400 hover:underline">{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{children}</a>;
    },
    ...components,
  };
}
