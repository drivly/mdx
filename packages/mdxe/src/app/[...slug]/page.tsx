import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'
import path from 'path'
import { resolvePath, isMarkdownFile, getAllMarkdownFiles } from '../../utils/file-resolution'

export async function generateStaticParams() {
  const userCwd = process.env.USER_CWD || process.cwd()
  const files = await getAllMarkdownFiles(userCwd)
  return files.map(file => ({
    slug: file.split('/').filter(Boolean)
  }))
}

async function getContent(slug: string[]) {
  const slugPath = slug.join('/')
  const userCwd = process.env.USER_CWD || process.cwd()
  
  const userFilePath = resolvePath(path.join(userCwd, slugPath))
  
  if (userFilePath && isMarkdownFile(userFilePath)) {
    const content = await fs.readFile(userFilePath, 'utf-8')
    return content
  }
  
  const appFilePath = resolvePath(path.join(userCwd, slugPath))
  
  if (appFilePath && isMarkdownFile(appFilePath)) {
    const content = await fs.readFile(appFilePath, 'utf-8')
    return content
  }
  
  if (!slugPath && process.env.README_PATH) {
    try {
      const content = await fs.readFile(process.env.README_PATH, 'utf-8')
      return content
    } catch (e) {
      console.error('Error reading README:', e)
    }
  }
  
  // try {
  //   const payload = await createPayloadClient()
  //   const page = await payload.find({
  //     collection: 'pages',
  //     where: {
  //       slug: { equals: slugPath || 'index' },
  //       published: { equals: true }
  //     }
  //   })
    
  //   if (page.docs && page.docs.length > 0) {
  //     return page.docs[0].content
  //   }
  // } catch (e) {
  //   console.error('Error fetching from Payload:', e)
  // }
  
  return null
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const content = await getContent(params.slug)
  
  if (!content) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-4">The requested page could not be found.</p>
      </div>
    )
  }
  
  return (
    <article className="prose prose-slate max-w-7xl mx-auto p-4">
      <MDXRemote source={content} />
    </article>
  )
}
