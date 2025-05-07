export interface MDXSchema {
  title?: string;
  description?: string;
  date?: string;
  [key: string]: any;
}

export interface ProcessFileOptions {
  mode?: 'generate' | 'edit';
  prompt?: string;
  schema?: MDXSchema;
  model?: string;
  outputDir?: string;
  [key: string]: any;
}

export interface AIContentOptions {
  model?: string;
  schema?: MDXSchema;
  [key: string]: any;
}

export interface MDXAIConfig {
  apiKey: string;
  model: string;
  outputDir: string;
  templates: Record<string, any>;
  [key: string]: any;
}
