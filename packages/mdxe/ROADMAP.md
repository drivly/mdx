# mdxe Roadmap

This package will provide the notebook runtime and CLI.

1. **Initial Prototype**
   - Render MDX notebooks with editable code cells.
   - Run code cells inside a sandboxed iframe.
2. **Testing Integration**
   - Detect `test=true` code blocks and execute them with jest-lite.
   - Show pass/fail status next to each test cell.
3. **Persistence Layer**
   - Connect to Payload CMS for saving and loading notebooks.
   - Support basic CRUD via API routes and CLI commands.
4. **Advanced Editor Experience**
   - Monaco editor with syntax highlighting and live preview.
   - Debounced auto-run and cell reordering UI.
