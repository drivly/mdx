# TODO for mdxe Notebook Support

## Core Features
- [ ] Implement `NotebookCell` component rendering MDX code blocks with Monaco editor and live preview.
- [ ] Set up sandboxed code execution via iframe worker for secure evaluation.
- [ ] Inject testing utilities (`describe`, `it`, `expect`) using jest-lite for test cells.
- [ ] Persist notebook documents in Payload CMS; add API routes for CRUD operations.

## CLI Enhancements
- [ ] Add `mdxe notebook <file>` command to launch interactive notebook viewer.
- [ ] Provide commands to create and save notebooks to Payload CMS.

## Testing
- [ ] Write Vitest tests for notebook components and CLI flows.

