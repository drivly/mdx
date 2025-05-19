import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'
import { resolveMdxPath } from '../../utils/file-utils'
import { notFound } from 'next/navigation'

export interface PageProps {
  params?: Promise<{
    path?: string[]
  }>
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const slugPath = resolvedParams?.path?.join('/') || ''
  console.log('Resolving path:', slugPath)
  
  const filePath = await resolveMdxPath(slugPath)
  console.log('Resolved file path:', filePath)
  
  if (!filePath) {
    return notFound()
  }
  
  const content = await fs.readFile(filePath, 'utf-8')
  
  return (
    <article className="prose prose-slate max-w-7xl mx-auto p-4">
      <MDXRemote source={content} />
    </article>
  )
}
