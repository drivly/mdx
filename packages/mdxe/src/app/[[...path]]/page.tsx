import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'
import { resolveMdxPath } from '../../utils/file-utils'

export default async function Page({ params }: { params: { path?: string[] } }) {
  const slugPath = params.path?.join('/') || ''
  const filePath = await resolveMdxPath(slugPath)
  
  if (!filePath) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p>The requested page could not be found.</p>
      </div>
    )
  }
  
  const content = await fs.readFile(filePath, 'utf-8')
  
  return (
    <article className="prose prose-slate max-w-7xl mx-auto p-4">
      <MDXRemote source={content} />
    </article>
  )
}
