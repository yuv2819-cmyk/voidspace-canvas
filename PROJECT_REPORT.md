# VOIDSPACE Project Report

Date: February 13, 2026  
Project: VOIDSPACE  
Repository: `new-saas-project`

## 1. Executive Summary
VOIDSPACE is a browser-based visual workflow canvas built with Next.js App Router and React Flow.  
It provides a cyberpunk-themed node editor where users can create, connect, edit, resize, save, and restore workflow graphs.

Current product maturity: MVP+ (usable and stable for single-user local workflow editing).

## 2. Product Description
VOIDSPACE is designed as a modular visual logic builder similar to modern node-based automation tools.

Core user flow:
1. Open `/voidspace`.
2. Add nodes from the toolbar (Text, Quote, Code, Image, Todo).
3. Connect nodes with directional edges.
4. Edit content inline or from Inspector.
5. Resize nodes by drag handles or width/height controls.
6. Save and load workflows using backend API.

## 3. Current Technical Stack
- Next.js `14.2.35` (App Router)
- React `18.2.0`
- TypeScript (strict mode)
- Tailwind CSS
- React Flow (`@xyflow/react`)
- Next.js API route (Node.js runtime) for persistence
- File-based storage in `.voidspace/workflows`

## 4. Route and Module Architecture

### Routes
- `/` landing page
- `/voidspace` canvas application
- `/api/workflows/[id]` workflow read/write API

### Key Modules
- Canvas orchestration: `src/app/voidspace/page.tsx`
- Canvas UI shell: `src/components/voidspace/VoidspaceCanvas.tsx`
- Node types and typing: `src/components/voidspace/types.ts`
- Shared node UI: `src/components/voidspace/nodes/BaseNodeCard.tsx`
- Custom nodes:
  - `TextNode.tsx`
  - `QuoteNode.tsx`
  - `CodeNode.tsx`
  - `ImageNode.tsx`
  - `TodoNode.tsx`
- Persistence:
  - API route: `src/app/api/workflows/[id]/route.ts`
  - Store helper: `src/lib/workflow-store.ts`

## 5. Implemented Features

### Canvas and Interaction
- Full-screen React Flow canvas
- Drag, pan, zoom with bounds
- Directed smoothstep edges with arrows
- Node selection and edge selection
- Side connectors added (left/right) plus top/bottom
- Delete selected elements via keyboard and context menu

### Node Capabilities
- Text node: editable textarea
- Quote node: editable quote field
- Code node: editable code textarea
- Todo node: editable text + checkbox
- Image node:
  - URL input
  - local file upload
  - fallback preview when image fails

### Visual Design
- Cyberpunk UI theme (dark/light local toggle)
- Modular layered grid background
- Grid on/off toggle in toolbar
- Neon-accented inspector and controls

### Editing Quality
- Undo/redo stack with keyboard shortcuts
- Inspector panel:
  - title/subtitle edits
  - todo checked state
  - edge label edit
  - node width/height controls
- Node resize handles (`NodeResizer`) with min/max constraints

### Persistence
- Manual save/load buttons
- Debounced autosave
- Backend API persistence:
  - `PUT /api/workflows/default`
  - `GET /api/workflows/default`
- Disk persistence in local project folder

### DX and Launching
- `launch-voidspace.bat` one-click launcher
- Standard scripts: `dev`, `build`, `start`, `lint`

## 6. Current Gaps and Limitations
- Single default workflow id in UI (backend supports dynamic id, frontend currently fixed to `default`)
- No authentication or multi-user ownership model
- No collaboration or presence layer
- No workflow execution/simulation engine
- No formal version history timeline (only in-session undo/redo)
- No template marketplace or reusable subflow library yet

## 7. Upcoming Advanced Features (Roadmap)

### Priority A (High ROI)
1. Multi-workflow dashboard (create/list/rename/duplicate/delete)
2. Version snapshots and rollback
3. Auto-layout and tidy graph action
4. Strong connection typing (port-level validation)
5. Node groups/frames for large workflows

### Priority B (Product Depth)
1. Reusable subflows (convert selection to macro/module)
2. Template library (starter workflow packs)
3. Edge conditions and branching labels
4. Global variables panel and interpolation support
5. Command palette and advanced keyboard actions

### Priority C (SaaS Scale)
1. Team workspaces and role-based sharing
2. Real-time collaborative editing
3. Comments and review mode
4. Activity timeline and audit logs
5. Usage analytics and workflow health metrics

### Priority D (Intelligence Layer)
1. AI flow generation from prompt
2. AI optimization suggestions
3. Smart repair for disconnected paths
4. Assisted layout and naming cleanup

## 8. Delivery Milestones

## Milestone 1: Workflow Management
Timeline: 1 sprint  
Deliverables:
- workflow list UI
- dynamic workflow id routing/state
- create/rename/delete/duplicate actions
Acceptance:
- user can switch across multiple saved workflows without data loss

## Milestone 2: Versioning
Timeline: 1 sprint  
Deliverables:
- snapshot creation
- history panel
- restore/rollback controls
Acceptance:
- user can restore any saved version reliably

## Milestone 3: Auto-Layout + Grouping
Timeline: 1 sprint  
Deliverables:
- tidy graph button
- grouping frames
- collapse/expand frame behavior
Acceptance:
- large graphs become readable with one action

## Milestone 4: Strong Validation
Timeline: 1 sprint  
Deliverables:
- typed ports per node
- invalid connection prevention
- error panel for graph issues
Acceptance:
- invalid graph wiring prevented before save/run

## Milestone 5: Reusable Building Blocks
Timeline: 1 sprint  
Deliverables:
- subflow creation
- template save/use
- import/export bundle
Acceptance:
- users can reuse node patterns across workflows

## Milestone 6: Collaboration and Access
Timeline: 2 sprints  
Deliverables:
- auth + team model
- share permissions
- optional realtime collaboration foundation
Acceptance:
- multiple users can safely work in shared projects

## 9. Recommended Next 3 Builds (Immediate)
1. Multi-workflow management with dynamic ids
2. Version snapshots and rollback
3. Auto-layout + tidy graph action

## 10. Success Metrics (Suggested)
- Workflow completion time (create to saved final graph)
- Average number of undo operations per session
- Save/load failure rate
- Graph error rate (invalid connections)
- Weekly active creators
- Reuse rate of templates/subflows

## 11. Conclusion
VOIDSPACE now has a solid, extensible MVP foundation with strong canvas editing UX and local backend persistence.  
The fastest path to product-grade maturity is workflow management, versioning, and graph organization features.
