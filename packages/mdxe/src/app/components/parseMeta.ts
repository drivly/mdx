export function parseMeta(meta?: string): Record<string, any> {
  const result: Record<string, any> = {}
  if (!meta) return result
  const parts = meta.split(/\s+/)
  for (const part of parts) {
    const [k, v] = part.split('=')
    if (v === undefined) result[k] = true
    else result[k] = v.replace(/^"|"$/g, '')
  }
  return result
}
