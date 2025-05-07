/**
 * Standardized collection definitions for mdxdb
 */

export const Types = {
  slug: 'types',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'hash', type: 'text' },
    { name: 'type', type: 'code' },
    { name: 'json', type: 'json' },
    { name: 'schema', type: 'json' },
  ],
}

export const Resources = {
  slug: 'resources',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'sqid', type: 'text' },
    { name: 'hash', type: 'text' },
    { name: 'type', type: 'relationship', relationTo: ['types'] },
    { name: 'data', type: 'json' },
    { name: 'embedding', type: 'json' },
    { name: 'content', type: 'richText' },
  ],
}

export const Relationships = {
  slug: 'relationships',
  fields: [
    { name: 'subject', type: 'relationship', relationTo: 'resources' },
    { name: 'verb', type: 'text' },
    { name: 'object', type: 'relationship', relationTo: 'resources' },
    { name: 'hash', type: 'text' },
  ],
}

export const Users = {
  slug: 'users',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'image', type: 'text' },
    { name: 'role', type: 'select', options: ['user', 'admin', 'superAdmin'] },
    { name: 'emailVerified', type: 'checkbox' },
  ],
}

export const collections = {
  Types,
  Resources,
  Relationships,
  Users,
}
