"use client";

import { useMemo, useState, type RefObject } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type DefaultEdgeOptions,
  type EdgeMouseHandler,
  type OnEdgesChange,
  type OnEdgesDelete,
  type OnNodesChange,
  type OnNodesDelete,
  type NodeMouseHandler,
  type ReactFlowProps,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import type {
  VoidspaceEdge,
  VoidspaceNode,
  VoidspaceNodeBaseData,
  VoidspaceNodeKind,
} from "./types";
import CodeNode from "./nodes/CodeNode";
import ImageNode from "./nodes/ImageNode";
import QuoteNode from "./nodes/QuoteNode";
import TextNode from "./nodes/TextNode";
import TodoNode from "./nodes/TodoNode";

export type ThemeMode = "dark" | "light";

export type VoidspaceContextMenu = {
  id: string;
  type: "node" | "edge";
  x: number;
  y: number;
} | null;

const MIN_NODE_WIDTH = 220;
const MIN_NODE_HEIGHT = 150;
const MAX_NODE_WIDTH = 980;
const MAX_NODE_HEIGHT = 760;

const VIEW_BOUNDS = {
  minZoom: 0.5,
  maxZoom: 1.6,
  translateExtent: [
    [-3000, -2400],
    [3000, 2400],
  ] as [[number, number], [number, number]],
  nodeExtent: [
    [-2600, -2200],
    [2600, 2200],
  ] as [[number, number], [number, number]],
};

const TOOLBAR_BUTTONS: Array<{ kind: VoidspaceNodeKind; label: string }> = [
  { kind: "text", label: "Text" },
  { kind: "quote", label: "Quote" },
  { kind: "code", label: "Code" },
  { kind: "image", label: "Image" },
  { kind: "todo", label: "Todo" },
];

type VoidspaceCanvasProps = {
  theme: ThemeMode;
  nodes: VoidspaceNode[];
  edges: VoidspaceEdge[];
  canvasRef: RefObject<HTMLDivElement>;
  defaultEdgeOptions: DefaultEdgeOptions;
  connectionColor: string;
  toastMessage: string | null;
  contextMenu: VoidspaceContextMenu;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  selectedNode: VoidspaceNode | null;
  selectedEdge: VoidspaceEdge | null;
  onToggleTheme: () => void;
  onInit: (instance: ReactFlowInstance<VoidspaceNode, VoidspaceEdge>) => void;
  onNodesChange: OnNodesChange<VoidspaceNode>;
  onEdgesChange: OnEdgesChange<VoidspaceEdge>;
  onConnect: (connection: Connection) => void;
  onAddNode: (kind: VoidspaceNodeKind) => void;
  onSave: () => void;
  onLoad: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPaneClick: () => void;
  onPaneContextMenu: NonNullable<
    ReactFlowProps<VoidspaceNode, VoidspaceEdge>["onPaneContextMenu"]
  >;
  onNodeContextMenu: NodeMouseHandler<VoidspaceNode>;
  onEdgeContextMenu: EdgeMouseHandler<VoidspaceEdge>;
  onNodesDelete: OnNodesDelete<VoidspaceNode>;
  onEdgesDelete: OnEdgesDelete<VoidspaceEdge>;
  onContextDelete: () => void;
  onSelectedNodeChange: (patch: Partial<VoidspaceNodeBaseData>) => void;
  onSelectedNodeResize: (width: number, height: number) => void;
  onSelectedEdgeLabelChange: (label: string) => void;
  isValidConnection: NonNullable<
    ReactFlowProps<VoidspaceNode, VoidspaceEdge>["isValidConnection"]
  >;
};

function formatSavedTime(value: string | null): string {
  if (!value) {
    return "Not saved";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved";
  }

  return `Saved ${date.toLocaleTimeString()}`;
}

function dimensionValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function selectedNodeWidth(node: VoidspaceNode | null): number {
  if (!node) {
    return 320;
  }

  const width = dimensionValue(node.style?.width, dimensionValue(node.width, 320));
  return Math.min(Math.max(Math.round(width), MIN_NODE_WIDTH), MAX_NODE_WIDTH);
}

function selectedNodeHeight(node: VoidspaceNode | null): number {
  if (!node) {
    return 220;
  }

  const height = dimensionValue(
    node.style?.height,
    dimensionValue(node.height, 220)
  );
  return Math.min(Math.max(Math.round(height), MIN_NODE_HEIGHT), MAX_NODE_HEIGHT);
}

export default function VoidspaceCanvas({
  theme,
  nodes,
  edges,
  canvasRef,
  defaultEdgeOptions,
  connectionColor,
  toastMessage,
  contextMenu,
  canUndo,
  canRedo,
  isSaving,
  lastSavedAt,
  selectedNode,
  selectedEdge,
  onToggleTheme,
  onInit,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  onPaneClick,
  onPaneContextMenu,
  onNodeContextMenu,
  onEdgeContextMenu,
  onNodesDelete,
  onEdgesDelete,
  onContextDelete,
  onSelectedNodeChange,
  onSelectedNodeResize,
  onSelectedEdgeLabelChange,
  isValidConnection,
}: VoidspaceCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      quote: QuoteNode,
      code: CodeNode,
      image: ImageNode,
      todo: TodoNode,
    }),
    []
  );

  const minorGridColor = theme === "dark" ? "#12325088" : "#d946ef40";
  const majorGridColor = theme === "dark" ? "#22d3ee55" : "#9333ea55";
  const dotGridColor = theme === "dark" ? "#f0abfc28" : "#7c3aed2e";

  const saveStatus = isSaving ? "Saving..." : formatSavedTime(lastSavedAt);
  const edgeLabel =
    selectedEdge && typeof selectedEdge.label === "string"
      ? selectedEdge.label
      : "";
  const [isGridVisible, setIsGridVisible] = useState(true);

  const nodeWidth = selectedNodeWidth(selectedNode);
  const nodeHeight = selectedNodeHeight(selectedNode);

  return (
    <section className={theme === "dark" ? "dark" : ""}>
      <div className="relative min-h-screen overflow-hidden bg-[#faf6ff] text-slate-900 transition-colors duration-500 dark:bg-[#05070f] dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500/25 blur-3xl dark:block" />
          <div className="absolute right-0 top-8 h-[360px] w-[360px] rounded-full bg-fuchsia-500/30 blur-3xl dark:block" />
          <div className="absolute bottom-8 left-1/3 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl dark:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.09),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.1),transparent_38%)]" />
        </div>

        <header className="relative z-20 flex min-h-[78px] items-center justify-between border-b border-fuchsia-300/55 bg-white/95 px-4 py-3 transition-colors duration-500 dark:border-cyan-700/45 dark:bg-[#040711]/95">
          <div>
            <h1 className="text-lg font-black tracking-[0.08em] text-fuchsia-700 dark:text-cyan-200">
              VOIDSPACE
            </h1>
            <p className="text-xs uppercase tracking-[0.15em] text-fuchsia-500 dark:text-fuchsia-300">
              Cyberpunk workflow canvas
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-md border border-cyan-400 bg-cyan-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-400/35 dark:text-cyan-200"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </header>

        <div ref={canvasRef} className="relative z-10 h-[calc(100vh-78px)] w-full">
          <div className="absolute left-4 top-4 z-30 flex max-w-[68vw] flex-wrap gap-2 rounded-xl border border-fuchsia-300/65 bg-white/95 p-2 shadow-[0_0_24px_rgba(217,70,239,0.16)] transition-colors duration-500 dark:border-cyan-700/70 dark:bg-[#090d1d]/95">
            {TOOLBAR_BUTTONS.map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => onAddNode(item.kind)}
                className="rounded-md border border-fuchsia-300 bg-fuchsia-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-fuchsia-700 transition hover:bg-fuchsia-100 dark:border-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
              >
                + {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-100 dark:hover:bg-slate-500/20"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-100 dark:hover:bg-slate-500/20"
            >
              Redo
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onLoad}
              className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
            >
              Load
            </button>
            <button
              type="button"
              onClick={() => setIsGridVisible((current) => !current)}
              className="rounded-md border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
            >
              Grid: {isGridVisible ? "On" : "Off"}
            </button>
            <span className="self-center pl-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-cyan-300">
              {saveStatus}
            </span>
          </div>

          <div className="absolute right-4 top-4 z-30 w-[304px] rounded-xl border border-fuchsia-300/65 bg-white/95 p-3 shadow-[0_0_28px_rgba(217,70,239,0.17)] transition-colors duration-500 dark:border-cyan-700/75 dark:bg-[#090d1d]/95">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fuchsia-700 dark:text-cyan-200">
              Inspector
            </p>

            {selectedNode ? (
              <div className="mt-2 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">
                  Node: {selectedNode.type}
                </p>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                    Title
                  </span>
                  <input
                    type="text"
                    value={selectedNode.data.title ?? ""}
                    onChange={(event) =>
                      onSelectedNodeChange({ title: event.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-fuchsia-300/60 bg-white px-2 py-1 text-sm text-slate-800 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0f1530] dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                    Subtitle
                  </span>
                  <input
                    type="text"
                    value={selectedNode.data.subtitle ?? ""}
                    onChange={(event) =>
                      onSelectedNodeChange({ subtitle: event.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-fuchsia-300/60 bg-white px-2 py-1 text-sm text-slate-800 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0f1530] dark:text-slate-100"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                      Width
                    </span>
                    <input
                      type="number"
                      min={MIN_NODE_WIDTH}
                      max={MAX_NODE_WIDTH}
                      step={10}
                      value={nodeWidth}
                      onChange={(event) =>
                        onSelectedNodeResize(Number(event.target.value), nodeHeight)
                      }
                      className="mt-1 w-full rounded-md border border-fuchsia-300/60 bg-white px-2 py-1 text-sm text-slate-800 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0f1530] dark:text-slate-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                      Height
                    </span>
                    <input
                      type="number"
                      min={MIN_NODE_HEIGHT}
                      max={MAX_NODE_HEIGHT}
                      step={10}
                      value={nodeHeight}
                      onChange={(event) =>
                        onSelectedNodeResize(nodeWidth, Number(event.target.value))
                      }
                      className="mt-1 w-full rounded-md border border-fuchsia-300/60 bg-white px-2 py-1 text-sm text-slate-800 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0f1530] dark:text-slate-100"
                    />
                  </label>
                </div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Tip: drag node corners to resize quickly.
                </p>
                {selectedNode.type === "todo" ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedNode.data.checked)}
                      onChange={(event) =>
                        onSelectedNodeChange({ checked: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-400 bg-white accent-cyan-400 dark:bg-slate-800"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-100">
                      Completed
                    </span>
                  </label>
                ) : null}
              </div>
            ) : null}

            {!selectedNode && selectedEdge ? (
              <div className="mt-2 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">
                  Edge: {selectedEdge.source} -&gt; {selectedEdge.target}
                </p>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                    Label
                  </span>
                  <input
                    type="text"
                    value={edgeLabel}
                    onChange={(event) =>
                      onSelectedEdgeLabelChange(event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-fuchsia-300/60 bg-white px-2 py-1 text-sm text-slate-800 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0f1530] dark:text-slate-100"
                  />
                </label>
              </div>
            ) : null}

            {!selectedNode && !selectedEdge ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                Select a node or edge to edit properties.
              </p>
            ) : null}
          </div>

          <ReactFlow
            onInit={onInit}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            onPaneContextMenu={onPaneContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            deleteKeyCode={["Backspace", "Delete"]}
            connectionMode={ConnectionMode.Strict}
            connectionLineStyle={{
              stroke: connectionColor,
              strokeWidth: 2.2,
            }}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={VIEW_BOUNDS.minZoom}
            maxZoom={VIEW_BOUNDS.maxZoom}
            translateExtent={VIEW_BOUNDS.translateExtent}
            nodeExtent={VIEW_BOUNDS.nodeExtent}
            colorMode={theme}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            panOnScroll
          >
            {isGridVisible ? (
              <>
                <Background
                  id="grid-minor"
                  variant={BackgroundVariant.Lines}
                  gap={24}
                  size={0.8}
                  color={minorGridColor}
                />
                <Background
                  id="grid-major"
                  variant={BackgroundVariant.Lines}
                  gap={120}
                  size={1.4}
                  color={majorGridColor}
                />
                <Background
                  id="grid-dot"
                  variant={BackgroundVariant.Dots}
                  gap={24}
                  size={1.1}
                  color={dotGridColor}
                />
              </>
            ) : null}
            <MiniMap
              pannable
              zoomable
              className="!rounded-md !border !border-fuchsia-300 !bg-white/95 dark:!border-cyan-700 dark:!bg-[#0b1022]"
            />
            <Controls className="!border !border-fuchsia-300 !bg-white dark:!border-cyan-700 dark:!bg-[#0b1022]" />
          </ReactFlow>

          {contextMenu ? (
            <div
              className="fixed z-50 rounded-md border border-fuchsia-300 bg-white p-1 shadow-lg dark:border-cyan-700 dark:bg-[#0b1022]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <button
                type="button"
                onClick={onContextDelete}
                className="block rounded px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
              >
                Delete
              </button>
            </div>
          ) : null}

          {toastMessage ? (
            <div className="pointer-events-none absolute bottom-4 right-4 z-40 rounded-md border border-fuchsia-300 bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-fuchsia-700 shadow-md dark:border-cyan-700 dark:bg-[#0b1022]/95 dark:text-cyan-200">
              {toastMessage}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
