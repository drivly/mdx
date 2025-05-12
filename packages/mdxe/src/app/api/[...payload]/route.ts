import { createPayloadClient } from '../../../payload'
import { NextRequest, NextResponse } from 'next/server'

async function handler(req: NextRequest) {
  try {
    const payload = await createPayloadClient()
    
    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.replace('/api/payload', '')
    
    switch (method) {
      case 'GET':
        return NextResponse.json(await payload.find({ collection: path }))
      case 'POST':
        return NextResponse.json(await payload.create({ collection: path, data: await req.json() }))
      case 'PUT':
      case 'PATCH':
        return NextResponse.json(await payload.update({ collection: path, data: await req.json() }))
      case 'DELETE':
        return NextResponse.json(await payload.delete({ collection: path }))
      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }
  } catch (error) {
    console.error('Payload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler

export const dynamic = 'force-dynamic'
