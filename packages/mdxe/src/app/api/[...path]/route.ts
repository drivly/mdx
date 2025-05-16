import { NextRequest, NextResponse } from 'next/server'
import { resolvePath, isMarkdownFile, filePathToRoutePath } from '../../../utils/file-resolution'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const fullPath = params.path.join('/')
    const userCwd = process.env.USER_CWD || process.cwd()
    const filePath = resolvePath(path.join(userCwd, fullPath))
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    if (!isMarkdownFile(filePath)) {
      return NextResponse.json(
        { error: 'Not a markdown file' },
        { status: 400 }
      )
    }
    
    const content = await fs.readFile(filePath, 'utf-8')
    
    return NextResponse.json({
      content,
      path: filePathToRoutePath(filePath, userCwd),
    })
  } catch (error) {
    console.error('Error serving MDX file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
