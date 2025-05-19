# Roadmap

The project will evolve to support a web-based MDX notebook environment. High level goals:

- Build an interactive notebook system using **Next.js 13** with an App Router.
- Use **MDX** to author notebook content and render code cells as React components.
- Provide a **Monaco** based editor for each code cell with live preview.
- Run user code in a **sandboxed iframe** or Web Worker for security.
- Integrate **jest-lite** or similar to allow test cells with `describe`, `it`, and `expect`.
- Store notebooks in **Payload CMS** backed by SQLite by default.
- Offer CLI commands in `mdxe` to create, edit, and serve notebooks.
