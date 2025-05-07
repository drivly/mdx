# MDXE

Zero-config CLI for serving Markdown and MDX files with Next.js.

## Features

- Zero-config setup for serving Markdown and MDX files
- Automatic serving of .md and .mdx files
- Support for index.md, page.md, or README.md as root index files
- Tailwind CSS with Typography plugin for styling
- Includes all components from mdxui package

## Installation

```bash
npm install mdxe
# or
yarn add mdxe
# or
pnpm add mdxe
```

## Usage

### Basic Usage

```bash
# Serve the current directory
mdxe

# Serve a specific file
mdxe path/to/file.md

# Serve a specific directory
mdxe path/to/directory
```

### Next.js Commands

MDXE supports all standard Next.js commands:

```bash
# Start development server
mdxe dev

# Build for production
mdxe build

# Start production server
mdxe start

# Run linting
mdxe lint
```

## Configuration

MDXE works with zero configuration, but you can customize it by creating the following files:

- `next.config.js` - Custom Next.js configuration
- `tailwind.config.js` - Custom Tailwind CSS configuration
- `mdx-components.js` - Custom MDX components

## License

MIT
