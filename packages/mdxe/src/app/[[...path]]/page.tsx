import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs/promises';
import { notFound } from 'next/navigation';
import { resolveMdxPath } from '../../utils/file-utils';

export default async function Page({ params }: { params: { path?: string[] } }) {
  const slugPath = params.path?.join('/') || '';
  const filePath = await resolveMdxPath(slugPath);
  
  if (!filePath) {
    notFound();
  }
  
  const content = await fs.readFile(filePath, 'utf-8');
  
  return (
    <article className="prose dark:prose-invert prose-lg max-w-4xl mx-auto">
      <MDXRemote source={content} />
    </article>
  );
}
