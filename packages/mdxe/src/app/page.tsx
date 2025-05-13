import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs/promises'

export default async function Page() {
  if (process.env.README_PATH) {
    try {
      const content = await fs.readFile(process.env.README_PATH, 'utf-8')
      return (
        <article className="prose prose-slate max-w-none p-4">
          <MDXRemote source={content} />
        </article>
      )
    } catch (e) {
      console.error('Error reading README:', e)
    }
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome to MDX</h1>
      <p className="mt-4">Edit your MDX files to see changes here.</p>
    </div>
  )
}
