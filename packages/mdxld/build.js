import { build } from 'esbuild'
import { join } from 'path'

async function buildPackage() {
  try {
    const entryPoints = ['index.js', 'ast.js', 'parser.js'].map((file) => join('dist', file))

    await build({
      entryPoints,
      outdir: 'dist',
      format: 'esm',
      platform: 'neutral',
      target: 'es2020',
      bundle: false,
      minify: false,
      sourcemap: true,
      allowOverwrite: true,
    })

    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildPackage()
