import { defineConfig, s } from 'velite'
import type { Payload } from 'payload'
import path from 'path'

// Using type assertion to bypass TypeScript error for 'watch' property
const config = {
  root: path.join(process.cwd(), 'content'),
  
  output: {
    clean: true,
  },
  
  watch: true,
  
  collections: {
    mdx: {
      name: 'MDX',
      pattern: '**/*.mdx',
      schema: s.object({
        folder: s.string(),
        id: s.string(),
        content: s.markdown(),
        data: s.object({}).passthrough(),
      }),
      transform: async (data: any, filePath: string) => {
        const relativePath = path.relative(path.join(process.cwd(), 'content'), filePath)
        const pathParts = relativePath.split(path.sep)
        const fileName = path.basename(filePath, '.mdx')
        
        const folder = pathParts.length > 1 ? pathParts[0] : 'root'
        const id = fileName
        
        try {
          const payload = await getPayloadClient()
          
          const folderDoc = await payload.find({
            collection: 'folders',
            where: {
              id: {
                equals: folder,
              },
            },
          })
          
          let folderId = folderDoc.docs[0]?.id
          if (!folderId) {
            const newFolder = await payload.create({
              collection: 'folders',
              data: {
                id: folder,
              },
            })
            folderId = newFolder.id
          }
          
          const existingDoc = await payload.find({
            collection: 'mdx',
            where: {
              id: {
                equals: id,
              },
              folder: {
                equals: folderId,
              },
            },
          })
          
          if (existingDoc.docs.length > 0) {
            await payload.update({
              collection: 'mdx',
              id: existingDoc.docs[0].id,
              data: {
                content: data.content,
                data: data.data,
              },
            })
          } else {
            await payload.create({
              collection: 'mdx',
              data: {
                folder: folderId,
                id,
                content: data.content,
                data: data.data,
              },
            })
          }
          
          console.log(`Updated MDX document: ${folder}/${id}`)
        } catch (error) {
          console.error('Error updating database:', error)
        }
        
        return {
          ...data,
          folder,
          id,
        }
      },
    },
  },
}

export default defineConfig(config as any)

let payloadClient: Payload | null = null

export async function getPayloadClient(): Promise<Payload> {
  if (!payloadClient) {
    try {
      const payload = await import('payload')
      
      if (payload.default) {
        try {
          const collections = payload.default.collections
          if (collections) {
            payloadClient = payload.default
          }
        } catch (error) {
          payloadClient = await payload.default.init({
            secret: process.env.PAYLOAD_SECRET || 'secret',
          } as any)
        }
      }
    } catch (error) {
      console.error('Error initializing Payload:', error)
    }
  }
  
  return payloadClient as Payload
}
