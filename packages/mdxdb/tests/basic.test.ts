import { db } from '../src'
import fs from 'fs-extra'
import path from 'path'
import { MDXData, MDXDBProxy } from '../src/types'
import { describe, beforeEach, test, expect, vi } from 'vitest'

vi.mock('fs-extra', () => {
  return {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn(),
    readdir: vi.fn(),
  }
})

const typedDb = db as unknown as {
  blog: {
    posts: {
      set: (id: string, data: MDXData) => Promise<MDXData>
      get: (id: string) => Promise<MDXData | null>
      list: () => Promise<Array<MDXData & { id: string }>>
    }
  }
}

describe('mdxdb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should set data and return it', async () => {
    const data: MDXData = { title: 'Hello, MDX!' }
    const result = await typedDb.blog.posts.set('hello-world', data)

    expect(fs.mkdir).toHaveBeenCalledWith('.db/blog/posts', { recursive: true })
    expect(fs.writeFile).toHaveBeenCalledWith('.db/blog/posts/hello-world.mdx', expect.stringContaining(JSON.stringify(data, null, 2)))
    expect(result).toEqual(data)
  })

  test('should get data from file', async () => {
    const data: MDXData = { title: 'Hello, MDX!' }
    const fileContent = `---\n${JSON.stringify(data, null, 2)}\n---\n`

    const mockReadFile = fs.readFile as unknown as ReturnType<typeof vi.fn>
    mockReadFile.mockResolvedValueOnce(fileContent)

    const result = await typedDb.blog.posts.get('hello-world')

    expect(fs.readFile).toHaveBeenCalledWith('.db/blog/posts/hello-world.mdx', 'utf-8')
    expect(result).toEqual(data)
  })

  test('should return null when file does not exist', async () => {
    const mockReadFile = fs.readFile as unknown as ReturnType<typeof vi.fn>
    mockReadFile.mockRejectedValueOnce({ code: 'ENOENT' })

    const result = await typedDb.blog.posts.get('non-existent')

    expect(result).toBeNull()
  })

  test('should list files in directory', async () => {
    const mockReaddir = fs.readdir as unknown as ReturnType<typeof vi.fn>
    mockReaddir.mockResolvedValueOnce(['hello-world.mdx', 'second-post.mdx'])

    const firstData: MDXData = { title: 'Hello, MDX!' }
    const secondData: MDXData = { title: 'Second Post' }

    const mockReadFile = fs.readFile as unknown as ReturnType<typeof vi.fn>
    mockReadFile.mockResolvedValueOnce(`---\n${JSON.stringify(firstData, null, 2)}\n---\n`)
    mockReadFile.mockResolvedValueOnce(`---\n${JSON.stringify(secondData, null, 2)}\n---\n`)

    const result = await typedDb.blog.posts.list()

    expect(fs.readdir).toHaveBeenCalledWith('.db/blog/posts')
    expect(result).toEqual([
      { id: 'hello-world', ...firstData },
      { id: 'second-post', ...secondData },
    ])
  })

  test('should support arbitrary depth folder hierarchy', async () => {
    const data: MDXData = { title: 'Nested Content' }

    const nestedDb = db as unknown as {
      blog: {
        categories: {
          tech: {
            articles: {
              set: (id: string, data: MDXData) => Promise<MDXData>
              get: (id: string) => Promise<MDXData | null>
            }
          }
        }
      }
    }

    await nestedDb.blog.categories.tech.articles.set('nested-article', data)

    expect(fs.mkdir).toHaveBeenCalledWith('.db/blog/categories/tech/articles', { recursive: true })
    expect(fs.writeFile).toHaveBeenCalledWith('.db/blog/categories/tech/articles/nested-article.mdx', expect.stringContaining(JSON.stringify(data, null, 2)))
  })
})
