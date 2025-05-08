# mdxdb

[![npm version](https://img.shields.io/npm/v/mdxdb.svg)](https://www.npmjs.com/package/mdxdb)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> MDX-based database that treats MDX files as collections with database.do interface

`mdxdb` is a package that allows you to work with MDX files as a database using the database.do interface. It provides a clean interface for database operations with local MDX files or Payload CMS, storing document data in MDX frontmatter or a Payload CMS database.

## Features

- **Multiple Backends** - Support for both filesystem and Payload CMS backends
- **Local MDX Files** - Works with local MDX files instead of remote API calls
- **Filesystem Storage** - Stores document data in MDX frontmatter
- **Payload CMS Integration** - Seamless integration with Payload CMS
- **List + CRUD Operations** - Full support for database operations
- **API Compatibility** - Maintains API compatibility with `database.do`
- **Configurable** - Supports options like base path and file extension
- **Standardized Collections** - Four standardized collections: Types, Resources, Relationships, and Users

## Installation

```bash
# Using npm
npm install mdxdb

# Using yarn
yarn add mdxdb

# Using pnpm
pnpm add mdxdb
```

## Quick Start

### Filesystem Backend (Default)

```typescript
import { DB } from 'mdxdb'

// Initialize with filesystem backend (default)
const fileDb = DB({
  basePath: './content', // Base directory for MDX files
  fileExtension: '.mdx', // File extension for MDX files
  createDirectories: true, // Create directories if they don't exist
})

// Create a new post
const post = await fileDb.posts.create({
  title: 'Getting Started with mdxdb',
  content: 'This is a sample post created with mdxdb',
  status: 'Published',
  tags: ['mdx', 'tutorial'],
  author: 'author123',
})

// Query posts with filtering
const publishedPosts = await fileDb.posts.find({
  where: {
    status: 'Published',
    author: 'author123',
  },
})

// Get a post by ID
const singlePost = await fileDb.posts.findOne(post.id)

// Update a post
await fileDb.posts.update(post.id, {
  title: 'Updated Title',
})

// Delete a post
await fileDb.posts.delete(post.id)
```

### Payload CMS Backend

```typescript
import { DB } from 'mdxdb'
import { getPayload } from 'payload'
import config from './payload.config'

// Initialize Payload CMS
const payload = await getPayload({
  config,
  secret: process.env.PAYLOAD_SECRET || 'default-secret-key',
  local: true,
})

// Initialize with Payload CMS backend
const payloadDb = DB({
  backend: 'payload',
  payload: payload, // Payload CMS instance
})

// Create a new resource
const resource = await payloadDb.resources.create({
  name: 'Example Resource',
  type: 'article',
  data: { key: 'value' },
})

// Query resources with filtering
const resources = await payloadDb.resources.find({
  where: {
    type: 'article',
  },
})

// Get a resource by ID
const singleResource = await payloadDb.resources.findOne(resource.id)

// Update a resource
await payloadDb.resources.update(resource.id, {
  name: 'Updated Resource',
})

// Delete a resource
await payloadDb.resources.delete(resource.id)
```

## API Reference

### DB Configuration

Initialize the database client with optional configuration:

```typescript
import { DB } from 'mdxdb'

const db = DB({
  backend?: 'filesystem' | 'payload', // Optional, defaults to 'filesystem'

  // Filesystem backend options (only used when backend is 'filesystem')
  basePath?: string, // Optional, defaults to '.db'
  fileExtension?: string, // Optional, defaults to '.mdx'
  createDirectories?: boolean, // Optional, defaults to true

  // Payload backend options (only used when backend is 'payload')
  payload?: PayloadCMS, // Required for payload backend
})
```

### Collection Methods

#### db.{collection}.find(options?)

Retrieves multiple documents from a collection with optional filtering, sorting, and pagination.

```typescript
const results = await db.posts.find({
  where: {
    status: 'Published',
    author: 'author123',
  },
  sort: 'createdAt:desc',
  limit: 10,
  page: 1,
})
```

#### db.{collection}.findOne(id)

Retrieves a single document by its ID.

```typescript
const document = await db.posts.findOne('document-id')
```

#### db.{collection}.create(data)

Creates a new document in the collection.

```typescript
const newDocument = await db.posts.create({
  title: 'New Post',
  content: 'This is a new post',
})
```

#### db.{collection}.update(id, data)

Updates an existing document by its ID.

```typescript
const updatedDocument = await db.posts.update('document-id', {
  title: 'Updated Title',
})
```

#### db.{collection}.delete(id)

Deletes a document by its ID.

```typescript
await db.posts.delete('document-id')
```

#### db.{collection}.search(query, options?)

Performs a text search across documents in a collection.

```typescript
const searchResults = await db.posts.search('search term', {
  limit: 20,
  sort: 'relevance:desc',
})
```

### Standardized Collections

The package includes four standardized collections:

#### Types

```typescript
// Types collection
const type = await db.types.create({
  name: 'Article',
  hash: 'article-hash',
  type: 'code',
  json: {
    /* schema definition */
  },
  schema: {
    /* JSON schema */
  },
})
```

#### Resources

```typescript
// Resources collection
const resource = await db.resources.create({
  name: 'Example Resource',
  sqid: 'resource-sqid',
  hash: 'resource-hash',
  type: 'article-id', // ID of a type
  data: {
    /* resource data */
  },
  embedding: {
    /* vector embedding */
  },
  content: 'Rich text content',
})
```

#### Relationships

```typescript
// Relationships collection
const relationship = await db.relationships.create({
  subject: 'resource-id-1', // ID of a resource
  verb: 'contains',
  object: 'resource-id-2', // ID of a resource
  hash: 'relationship-hash',
})
```

#### Users

```typescript
// Users collection
const user = await db.users.create({
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://example.com/avatar.jpg',
  role: 'admin',
  emailVerified: true,
})
```

## Dependencies

- [fs-extra](https://github.com/jprichardson/node-fs-extra) - For filesystem operations
- [payload](https://github.com/payloadcms/payload) - For Payload CMS integration (optional)

## License

MIT
