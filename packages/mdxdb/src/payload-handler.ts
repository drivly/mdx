import { MDXData, MDXListItem } from './types'

/**
 * Handles Payload CMS operations for MDX database
 */
export class PayloadHandler {
  private payload: any

  /**
   * Creates a new PayloadHandler
   * @param payloadInstance Payload CMS instance
   */
  constructor(payloadInstance: any) {
    this.payload = payloadInstance
  }

  /**
   * Writes data to a Payload CMS collection
   * @param pathSegments Array of path segments that form the collection path
   * @param data The data to write to the collection
   * @returns The data that was written
   */
  async writeMDX(pathSegments: string[], data: MDXData): Promise<MDXData> {
    const collection = pathSegments[0]
    const id = pathSegments[pathSegments.length - 1]

    try {
      try {
        await this.payload.findByID({
          collection,
          id,
        })

        await this.payload.update({
          collection,
          id,
          data,
        })
      } catch (error) {
        await this.payload.create({
          collection,
          data: { id, ...data },
        })
      }

      return data
    } catch (error) {
      console.error('Error writing to Payload CMS:', error)
      throw error
    }
  }

  /**
   * Reads data from a Payload CMS collection
   * @param pathSegments Array of path segments that form the collection path
   * @returns The data from the collection or null if it doesn't exist
   */
  async readMDX(pathSegments: string[]): Promise<MDXData | null> {
    const collection = pathSegments[0]
    const id = pathSegments[pathSegments.length - 1]

    try {
      const doc = await this.payload.findByID({
        collection,
        id,
      })

      if (!doc) {
        return null
      }

      return doc
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      console.error('Error reading from Payload CMS:', error)
      throw error
    }
  }

  /**
   * Lists all documents in a Payload CMS collection
   * @param pathSegments Array of path segments that form the collection path
   * @returns Array of objects containing the document ID and its data
   */
  async listMDX(pathSegments: string[]): Promise<MDXListItem[]> {
    const collection = pathSegments[0]

    try {
      const result = await this.payload.find({
        collection,
        limit: 1000,
      })

      return result.docs.map((doc: any) => ({
        id: doc.id,
        ...doc,
      }))
    } catch (error: any) {
      if (error.status === 404) {
        return []
      }
      console.error('Error listing from Payload CMS:', error)
      throw error
    }
  }
}
