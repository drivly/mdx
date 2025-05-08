import payload from 'payload'
import { getPayloadConfig } from './config'

let cached = (global as any).payload

if (!cached) {
  (global as any).payload = {
    client: null,
    promise: null,
  }
  cached = (global as any).payload
}

export const createPayloadClient = async () => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    try {
      const config = getPayloadConfig()
      cached.promise = payload.init({
        config: config as any,
        secret: process.env.PAYLOAD_SECRET || 'mdxe-payload-secret',
      }) as any
    } catch (error) {
      console.error('Error initializing Payload:', error)
      cached.promise = Promise.resolve(null as any)
    }
  }

  try {
    cached.client = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.client
}

export { getPayloadConfig } from './config'
