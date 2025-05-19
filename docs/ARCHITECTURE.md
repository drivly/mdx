# Project Architecture

This document provides an overview of how the MDX notebook environment is structured. It references the [roadmap](../ROADMAP.md) goals and outlines the core pieces of the system.

## Roadmap Highlights

- Next.js 13 with the App Router for an interactive notebook interface
- MDX-based content with code cells rendered as React components
- Monaco editor for live code preview
- Sandboxed execution of user code via iframe or Web Worker
- jest-lite integration for test cells
- Notebook storage in Payload CMS with SQLite by default
- CLI commands through `mdxe` to create, edit and serve notebooks


## Embedded Next.js Application

The `mdxe` package contains a Next.js application that is started by the CLI. When a user runs `mdxe`, the application serves markdown or MDX files from the working directory. Routes under `app/api` expose serverless functions used by the embedded app. The architecture allows the same Next.js instance to mount Payload CMS APIs.

### Interaction with Payload CMS

Payload CMS is bundled with the Next.js server to provide storage for notebooks and other structured content. By default the CMS uses SQLite so the project can run locally without additional services. The embedded Next.js app exposes Payload's REST endpoints under the `/api` route. Notebook content can therefore be created and retrieved through Payload while still being rendered with the MDX components shipped in `mdxe`.

## Notebook Storage and Serving

Notebook files are stored either in the local filesystem or in the Payload CMS database. The `mdxdb` package abstracts these storage backends. When working locally the CLI reads `.md` and `.mdx` files from disk. In production you can enable the Payload backend to persist notebooks to the database. The embedded Next.js app reads notebooks from the active backend and renders them using `next-mdx-remote`.

## Development

```bash
pnpm install
pnpm dev
```

Running `pnpm dev` starts the Turbo repo in watch mode and launches the embedded Next.js app. Edit files within `packages/mdxe` to update the web interface. The CLI can be run with `pnpm mdxe` from any directory containing notebooks.

## Deployment

The project uses Vercel for deployments. Build the packages with:

```bash
pnpm build
```

Then deploy the output of `packages/mdxe` to Vercel or another Node.js environment. The default SQLite database works in serverless mode but can be replaced with Postgres when running Payload in production.

---

The roadmap lists additional goals such as using Monaco for notebook editing, sandboxed execution of code cells, and integrating jest-lite for test cells. This architecture lays the foundation for those future enhancements.
