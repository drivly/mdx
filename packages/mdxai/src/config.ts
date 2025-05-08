import fs from 'fs/promises'
import path from 'path'
import { MDXAIConfig } from './types.js'

const CONFIG_FILE = '.mdxai.json'
const DEFAULT_CONFIG: MDXAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o',
  outputDir: './output',
  templates: {},
}

export async function loadConfig(): Promise<MDXAIConfig> {
  try {
    const configPath = path.resolve(process.cwd(), CONFIG_FILE)
    const configExists = await fileExists(configPath)

    if (!configExists) {
      console.log(`Configuration file not found: ${CONFIG_FILE}`)
      console.log('Using default configuration')
      return DEFAULT_CONFIG
    }

    const configContent = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configContent) as Partial<MDXAIConfig>

    return {
      ...DEFAULT_CONFIG,
      ...config,
    }
  } catch (err) {
    console.error('Error loading configuration:', err)
    return DEFAULT_CONFIG
  }
}

export async function saveConfig(config: Partial<MDXAIConfig>): Promise<boolean> {
  try {
    const configPath = path.resolve(process.cwd(), CONFIG_FILE)
    const configContent = JSON.stringify(config, null, 2)

    await fs.writeFile(configPath, configContent)
    console.log(`Configuration saved to: ${CONFIG_FILE}`)

    return true
  } catch (err) {
    console.error('Error saving configuration:', err)
    throw err
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
