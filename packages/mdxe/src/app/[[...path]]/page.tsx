import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'
import { resolveMdxPath, getAllMarkdownFiles, filePathToRoutePath, shouldExcludePath } from '../../utils/file-utils'
import { notFound } from 'next/navigation'

export interface PageProps {
  params: {
    path?: string[]
  }
}

export async function generateStaticParams() {
  try {
    const userCwd = process.env.USER_CWD || process.cwd()
    console.log('Generating static params from:', userCwd)
    
    const markdownFiles = await getAllMarkdownFiles(userCwd)
    console.log('Found markdown files:', markdownFiles.length)
    
    return markdownFiles
      .filter(filePath => !shouldExcludePath(filePath))
      .map(filePath => {
        const routePath = filePathToRoutePath(filePath)
        const segments = routePath.split('/').filter(Boolean)
        
        return {
          path: segments.length > 0 ? segments : undefined
        }
      })
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function Page({ params }: PageProps) {
  try {
    const slugPath = params?.path?.join('/') || ''
    console.log('Resolving path:', slugPath)
    
    const filePath = await resolveMdxPath(slugPath)
    console.log('Resolved file path:', filePath)
    
    if (!filePath) {
      console.log('File not found, returning 404')
      return notFound()
    }
    
    const content = await fs.readFile(filePath, 'utf-8')
    
    return (
      <article style={{ maxWidth: '70rem', margin: '0 auto', padding: '1rem' }}>
        <MDXRemote source={content} />
      </article>
    )
  } catch (error) {
    console.error('Error rendering markdown file:', error)
    return notFound()
  }
}
