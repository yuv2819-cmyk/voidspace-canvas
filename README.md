# Voidspace Canvas

A dark, node-based workspace for arranging text, quotes, code, images, and todos on a directed graph.

Built as an MVP visual canvas — closer to a spatial notebook than a notes CRUD app.

**Live:** [voidspace-canvas.vercel.app](https://voidspace-canvas.vercel.app) · canvas lives at `/voidspace`

## What works today

- Full-screen React Flow canvas (pan, zoom, select)
- Node types: Text, Quote, Code, Image, Todo
- Directed edges with labels
- Inline edit + inspector (title, size, edge label)
- Resize handles with min/max constraints
- Undo / redo
- Dark / light toggle, grid on/off
- Save / load + debounced autosave via `PUT/GET /api/workflows/:id`
- File-backed store under `.voidspace/workflows`

Not built yet: multi-user auth, execution engine, collaboration, version history beyond in-session undo.

## Stack

- Next.js App Router + TypeScript
- React Flow (`@xyflow/react`)
- Tailwind CSS
- Next.js API route for persistence

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000/voidspace`.

Windows: double-click `launch-voidspace.bat`.

## Layout

```text
src/app/voidspace/page.tsx          canvas route
src/components/voidspace/           canvas shell + nodes
src/app/api/workflows/[id]/route.ts persistence
src/lib/workflow-store.ts           disk store
```

More detail in [PROJECT_REPORT.md](./PROJECT_REPORT.md).
