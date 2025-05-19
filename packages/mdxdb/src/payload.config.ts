// storage-adapter-import-placeholder
// import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import type { Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import fs from 'fs'

import { db } from './databases/sqlite'
import { Users } from './collections/Users'
import { Folders } from './collections/Folders'
import { MDX } from './collections/MDX'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const contentDir = path.resolve(process.cwd(), 'content')
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true })
}

async function startVeliteWatcher() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { build } = await import('velite')
      
      console.log('Starting Velite file watcher for MDX content...')
      await build({ watch: true })
      console.log('Velite file watcher started successfully')
    } catch (error) {
      console.error('Error starting Velite file watcher:', error)
    }
  }
}

const velitePlugin = {
  afterInit: async (payload: any) => {
    await startVeliteWatcher()
    return payload
  }
} as unknown as Plugin

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '/components/Icon',
        Logo: '/components/Logo',
      },
    },
    autoLogin: { email: 'admin@example.com', password: 'test' },
  },
  collections: [Users, Folders, MDX],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload.types.ts'),
  },
  db,
  sharp,
  plugins: [
    velitePlugin,
    // payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
