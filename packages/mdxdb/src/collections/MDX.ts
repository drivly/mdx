import type { CollectionConfig } from 'payload'
import { editorOptions } from '@/lib/collections'

export const MDX: CollectionConfig = {
  slug: 'mdx',
  labels: { singular: 'MDX', plural: 'MDX' },
  fields: [
    { type: 'row', fields: [
      { name: 'folder', type: 'relationship', relationTo: 'folders', required: true },
      { name: 'id', type: 'text', required: true },
    ] },
    { name: 'content', type: 'code', admin: { language: 'mdx', editorOptions } },
    { name: 'data', type: 'json', admin: { editorOptions, readOnly: true } },
  ],
}
