import { CollectionMethods, ListResponse, QueryOptions } from './database-do-types'
import { MDXFileSystemHandler } from './fs-handler'
import { PayloadHandler } from './payload-handler'
import { generateId, filterDocuments, sortDocuments, paginateDocuments, searchDocuments } from './utils'
import { MDXData, MDXListItem } from './types'

/**
 * Collection handler for MDX database
 */
export class MDXCollectionHandler<T = Record<string, unknown>> implements CollectionMethods<T> {
  private handler: MDXFileSystemHandler | PayloadHandler
  private collection: string

  /**
   * Creates a new MDXCollectionHandler
   * @param handler Database handler (filesystem or payload)
   * @param collection Collection name
   */
  constructor(handler: MDXFileSystemHandler | PayloadHandler, collection: string) {
    this.handler = handler
    this.collection = collection
  }

  /**
   * Finds documents in the collection
   * @param options Query options
   * @returns List of documents
   */
  async find(options?: QueryOptions): Promise<ListResponse<T>> {
    const documents = await this.handler.listMDX([this.collection])
    
    const filtered = filterDocuments(documents, options)
    const sorted = sortDocuments(filtered, options)
    return paginateDocuments(sorted, options) as ListResponse<T>
  }

  /**
   * Finds a document by ID
   * @param id Document ID
   * @returns Document
   */
  async findOne(id: string): Promise<T> {
    const document = await this.handler.readMDX([this.collection, id])
    
    if (!document) {
      throw new Error(`Document with ID ${id} not found in collection ${this.collection}`)
    }
    
    return { id, ...document } as unknown as T
  }

  /**
   * Creates a new document
   * @param data Document data
   * @returns Created document
   */
  async create(data: Partial<T>): Promise<T> {
    const id = (data as any).id || generateId()
    const result = await this.handler.writeMDX([this.collection, id], data as MDXData)
    
    return { id, ...result } as unknown as T
  }

  /**
   * Updates a document
   * @param id Document ID
   * @param data Document data
   * @returns Updated document
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const existingDoc = await this.handler.readMDX([this.collection, id])
    
    if (!existingDoc) {
      throw new Error(`Document with ID ${id} not found in collection ${this.collection}`)
    }
    
    const updatedData = { ...existingDoc, ...data }
    const result = await this.handler.writeMDX([this.collection, id], updatedData)
    
    return { id, ...result } as unknown as T
  }

  /**
   * Deletes a document
   * @param id Document ID
   * @returns Deleted document
   */
  async delete(id: string): Promise<T> {
    const document = await this.handler.readMDX([this.collection, id])
    
    if (!document) {
      throw new Error(`Document with ID ${id} not found in collection ${this.collection}`)
    }
    
    await this.handler.writeMDX([this.collection, id], { _deleted: true })
    
    return { id, ...document } as unknown as T
  }

  /**
   * Searches documents in the collection
   * @param query Search query
   * @param options Query options
   * @returns List of documents
   */
  async search(query: string, options?: QueryOptions): Promise<ListResponse<T>> {
    const documents = await this.handler.listMDX([this.collection])
    
    const searched = searchDocuments(documents, query)
    const filtered = filterDocuments(searched, options)
    const sorted = sortDocuments(filtered, options)
    return paginateDocuments(sorted, options) as ListResponse<T>
  }
}

/**
 * Creates a collection handler
 * @param handler Database handler
 * @param collection Collection name
 * @returns Collection handler
 */
export function createCollectionHandler<T = Record<string, unknown>>(
  handler: MDXFileSystemHandler | PayloadHandler,
  collection: string
): CollectionMethods<T> {
  return new MDXCollectionHandler<T>(handler, collection)
}
