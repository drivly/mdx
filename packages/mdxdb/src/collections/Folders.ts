import type { CollectionConfig } from 'payload'

export const Folders: CollectionConfig = {
  slug: 'folders',
  fields: [
    { name: 'id', type: 'text', required: true, label: 'ID' },
    { name: 'MDX', type: 'join', label: 'MDX', collection: 'mdx', on: 'folder' },
  ],
}
