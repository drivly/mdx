import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DB } from '../index'
import { PayloadHandler } from '../payload-handler'

const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}

describe('Payload backend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create a database client with Payload backend', () => {
    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    expect(db).toBeDefined()
    expect(typeof db.resources).toBe('object')
    expect(typeof db.types).toBe('object')
    expect(typeof db.relationships).toBe('object')
    expect(typeof db.users).toBe('object')
  })

  it('should find documents using Payload', async () => {
    mockPayload.find.mockResolvedValue({
      docs: [{ id: 'doc1', name: 'Test' }, { id: 'doc2', name: 'Test 2' }],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
    })

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    const result = await db.resources.find()

    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'resources',
      limit: 1000,
    })
    expect(result.data).toHaveLength(2)
    expect(result.meta.total).toBe(2)
  })

  it('should find a document by ID using Payload', async () => {
    mockPayload.findByID.mockResolvedValue({
      id: 'doc1',
      name: 'Test',
    })

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    const result = await db.resources.findOne('doc1')

    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: 'resources',
      id: 'doc1',
    })
    expect(result.id).toBe('doc1')
    expect(result.name).toBe('Test')
  })

  it('should create a document using Payload', async () => {
    mockPayload.create.mockResolvedValue({
      id: 'doc1',
      name: 'Test',
    })

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    const result = await db.resources.create({ name: 'Test' })

    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'resources',
      data: { name: 'Test' },
    })
    expect(result.id).toBe('doc1')
    expect(result.name).toBe('Test')
  })

  it('should update a document using Payload', async () => {
    mockPayload.findByID.mockResolvedValue({
      id: 'doc1',
      name: 'Test',
    })
    mockPayload.update.mockResolvedValue({
      id: 'doc1',
      name: 'Updated Test',
    })

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    const result = await db.resources.update('doc1', { name: 'Updated Test' })

    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: 'resources',
      id: 'doc1',
    })
    expect(mockPayload.update).toHaveBeenCalledWith({
      collection: 'resources',
      id: 'doc1',
      data: { name: 'Updated Test' },
    })
    expect(result.id).toBe('doc1')
    expect(result.name).toBe('Updated Test')
  })

  it('should handle errors when finding documents', async () => {
    mockPayload.find.mockRejectedValue(new Error('Database error'))

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    await expect(db.resources.find()).rejects.toThrow('Database error')
  })

  it('should handle errors when finding a document by ID', async () => {
    mockPayload.findByID.mockRejectedValue(new Error('Document not found'))

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    await expect(db.resources.findOne('doc1')).rejects.toThrow('Document not found')
  })

  it('should handle errors when creating a document', async () => {
    mockPayload.create.mockRejectedValue(new Error('Creation error'))

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    await expect(db.resources.create({ name: 'Test' })).rejects.toThrow('Creation error')
  })

  it('should handle errors when updating a document', async () => {
    mockPayload.findByID.mockResolvedValue({
      id: 'doc1',
      name: 'Test',
    })
    mockPayload.update.mockRejectedValue(new Error('Update error'))

    const db = DB({
      backend: 'payload',
      payload: mockPayload,
    })

    await expect(db.resources.update('doc1', { name: 'Updated Test' })).rejects.toThrow('Update error')
  })
})
