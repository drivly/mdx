import { defineConfig } from 'velite'
import type { Payload } from 'payload'
import path from 'path'

export default defineConfig({
  root: path.join(process.cwd(), 'content'),
  
  output: {
    clean: true,
  },
  
  watch: true,
  
  collections: {
    mdx: {
      name: 'MDX',
      pattern: '**/*.mdx',
      schema: {
        folder: { type: 'string', required: true },
        id: { type: 'string', required: true },
        content: { type: 'string' },
        data: { type: 'json' },
      },
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
})

let payloadClient: Payload | null = null

async function getPayloadClient(): Promise<Payload> {
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
          payloadClient = await payload.default.init()
        }
      }
    } catch (error) {
      console.error('Error initializing Payload:', error)
    }
  }
  
  return payloadClient as Payload
}
