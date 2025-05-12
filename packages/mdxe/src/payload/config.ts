import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload/types'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface UserConfig {
  admin?: {
    components?: Record<string, any>;
  };
  collections?: any[];
  plugins?: any[];
}

export const getPayloadConfig = (userConfig: UserConfig = {}) => {
  const dbPath = process.env.PAYLOAD_DB_PATH || path.resolve(process.cwd(), 'mdx.db')
  
  return {
    admin: {
      user: 'users',
      components: userConfig.admin?.components || {},
    },
    collections: [
      Users,
      Media,
      Pages,
      ...(userConfig.collections || []),
    ],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || 'mdxe-payload-secret',
    typescript: {
      outputFile: path.resolve(__dirname, 'payload-types.ts'),
    },
    db: sqliteAdapter({
      client: {
        url: process.env.DATABASE_URI || `sqlite://${dbPath}`,
      },
    }),
    plugins: [
      ...(userConfig.plugins || [])
    ],
  }
}
