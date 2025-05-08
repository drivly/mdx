import { MDXData, MDXListItem } from './types'
import { QueryOptions, ListResponse } from './database-do-types'

/**
 * Generates a unique ID
 * @returns Unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Filters documents based on query options
 * @param documents Documents to filter
 * @param options Query options
 * @returns Filtered documents
 */
export function filterDocuments<T extends MDXData>(documents: MDXListItem[], options?: QueryOptions): MDXListItem[] {
  if (!options?.where) {
    return documents
  }

  const whereConditions = options.where || {}

  return documents.filter((doc) => {
    for (const [key, value] of Object.entries(whereConditions)) {
      if (doc[key] !== value) {
        return false
      }
    }
    return true
  })
}

/**
 * Sorts documents based on query options
 * @param documents Documents to sort
 * @param options Query options
 * @returns Sorted documents
 */
export function sortDocuments<T extends MDXData>(documents: MDXListItem[], options?: QueryOptions): MDXListItem[] {
  if (!options?.sort) {
    return documents
  }

  const sortFields = Array.isArray(options.sort) ? options.sort : [options.sort]

  return [...documents].sort((a, b) => {
    for (const field of sortFields) {
      const isDesc = field.startsWith('-')
      const fieldName = isDesc ? field.substring(1) : field

      if (a[fieldName] < b[fieldName]) {
        return isDesc ? 1 : -1
      }
      if (a[fieldName] > b[fieldName]) {
        return isDesc ? -1 : 1
      }
    }
    return 0
  })
}

/**
 * Paginates documents based on query options
 * @param documents Documents to paginate
 * @param options Query options
 * @returns Paginated documents and metadata
 */
export function paginateDocuments<T extends MDXData>(documents: MDXListItem[], options?: QueryOptions): ListResponse<T> {
  const limit = options?.limit || 10
  const page = options?.page || 1
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedDocs = documents.slice(start, end)

  return {
    data: paginatedDocs as unknown as T[],
    meta: {
      total: documents.length,
      page,
      pageSize: limit,
      hasNextPage: end < documents.length,
    },
  }
}

/**
 * Searches documents based on query
 * @param documents Documents to search
 * @param query Search query
 * @returns Filtered documents that match the query
 */
export function searchDocuments<T extends MDXData>(documents: MDXListItem[], query: string): MDXListItem[] {
  if (!query) {
    return documents
  }

  const lowerQuery = query.toLowerCase()

  return documents.filter((doc) => {
    for (const value of Object.values(doc)) {
      if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
        return true
      }
    }
    return false
  })
}
