import { processFile } from './mdx-processor.js';
import { loadConfig } from './config.js';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class CLI {
  async init() {
    console.log('Initializing mdxai configuration...');
    const config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o',
      outputDir: './output',
      templates: {}
    };
    
    try {
      await fs.writeFile('.mdxai.json', JSON.stringify(config, null, 2));
      console.log('Configuration file created: .mdxai.json');
    } catch (err) {
      console.error('Failed to create configuration file:', err);
      throw err;
    }
  }
  
  async generate(targetPath, options = {}) {
    if (!targetPath) {
      throw new Error('Path is required for generate command');
    }
    
    console.log(`Generating MDX content for: ${targetPath}`);
    const config = await loadConfig();
    const mergedOptions = { ...config, ...options };
    
    try {
      if ((await fs.stat(targetPath).catch(() => null))?.isDirectory()) {
        const mdxFiles = await this.findMdxFiles(targetPath);
        for (const file of mdxFiles) {
          await processFile(file, { ...mergedOptions, mode: 'generate' });
        }
      } else {
        await processFile(targetPath, { ...mergedOptions, mode: 'generate' });
      }
      console.log('Generation completed successfully');
    } catch (err) {
      console.error('Generation failed:', err);
      throw err;
    }
  }
  
  async edit(targetPath, options = {}) {
    if (!targetPath) {
      throw new Error('Path is required for edit command');
    }
    
    console.log(`Editing MDX content in: ${targetPath}`);
    const config = await loadConfig();
    const mergedOptions = { ...config, ...options };
    
    try {
      if ((await fs.stat(targetPath).catch(() => null))?.isDirectory()) {
        const mdxFiles = await this.findMdxFiles(targetPath);
        for (const file of mdxFiles) {
          await processFile(file, { ...mergedOptions, mode: 'edit' });
        }
      } else {
        await processFile(targetPath, { ...mergedOptions, mode: 'edit' });
      }
      console.log('Edit completed successfully');
    } catch (err) {
      console.error('Edit failed:', err);
      throw err;
    }
  }
  
  async batch(pattern, options = {}) {
    if (!pattern) {
      throw new Error('Pattern is required for batch command');
    }
    
    console.log(`Processing files matching pattern: ${pattern}`);
    const config = await loadConfig();
    const mergedOptions = { ...config, ...options };
    
    try {
      const files = await glob(pattern);
      if (files.length === 0) {
        console.log('No files found matching the pattern');
        return;
      }
      
      console.log(`Found ${files.length} files to process`);
      for (const file of files) {
        await processFile(file, mergedOptions);
      }
      console.log('Batch processing completed successfully');
    } catch (err) {
      console.error('Batch processing failed:', err);
      throw err;
    }
  }
  
  private async findMdxFiles(directory) {
    try {
      const pattern = path.join(directory, '**/*.mdx');
      const files = await glob(pattern);
      return files;
    } catch (err) {
      console.error('Error finding MDX files:', err);
      throw err;
    }
  }
}
