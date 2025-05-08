import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'
import path from 'path'
import { resolvePath, isMarkdownFile, getAllMarkdownFiles } from '../../utils/file-resolution'
import { createPayloadClient } from '../../payload'

export async function generateStaticParams() {
  const files = await getAllMarkdownFiles(process.cwd())
  return files.map(file => ({
    slug: file.split('/').filter(Boolean)
  }))
}

async function getContent(slug: string[]) {
  const slugPath = slug.join('/')
  const filePath = resolvePath(path.join(process.cwd(), slugPath))
  
  if (filePath && isMarkdownFile(filePath)) {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  }
  
  try {
    const payload = await createPayloadClient()
    const page = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slugPath || 'index' },
        published: { equals: true }
      }
    })
    
    if (page.docs && page.docs.length > 0) {
      return page.docs[0].content
    }
  } catch (e) {
    console.error('Error fetching from Payload:', e)
  }
  
  return null
}

export default async function Page({ params }: { params: { slug: string[] } }) {
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
    <article className="prose prose-slate max-w-none p-4">
      <MDXRemote source={content} />
    </article>
  )
}
