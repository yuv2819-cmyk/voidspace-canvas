"use client";

import {
  addEdge,
  MarkerType,
  useEdgesState,
  useNodesState,
  type Connection,
  type DefaultEdgeOptions,
  type EdgeMarker,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type ReactFlowProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import VoidspaceCanvas, {
  type ThemeMode,
  type VoidspaceContextMenu,
} from "@/components/voidspace/VoidspaceCanvas";
import {
  VOIDSPACE_NODE_KINDS,
  type VoidspaceEdge,
  type VoidspaceNode,
  type VoidspaceNodeBaseData,
  type VoidspaceNodeKind,
} from "@/components/voidspace/types";

const WORKFLOW_API_ENDPOINT = "/api/workflows/default";
const HISTORY_LIMIT = 100;
const AUTOSAVE_DELAY_MS = 1200;
const MIN_NODE_WIDTH = 220;
const MIN_NODE_HEIGHT = 150;
const MAX_NODE_WIDTH = 980;
const MAX_NODE_HEIGHT = 760;

type WorkflowSnapshot = {
  nodes: VoidspaceNode[];
  edges: VoidspaceEdge[];
};

const INITIAL_NODES: VoidspaceNode[] = [];

function edgeColor(theme: ThemeMode): string {
  return theme === "dark" ? "#22d3ee" : "#4c1d95";
}

function edgeMarker(theme: ThemeMode): EdgeMarker {
  return {
    type: MarkerType.ArrowClosed,
    color: edgeColor(theme),
    width: 18,
    height: 18,
  };
}

function defaultNodeData(kind: VoidspaceNodeKind): VoidspaceNodeBaseData {
  const defaults: Record<VoidspaceNodeKind, VoidspaceNodeBaseData> = {
    text: {
      title: "Text",
      subtitle: "Note",
      text: "Add notes and context for this branch.",
    },
    quote: {
      title: "Quote",
      subtitle: "Inspiration",
      text: "Clarity creates velocity.",
    },
    code: {
      title: "Code",
      subtitle: "Logic",
      code: "const output = input;",
    },
    image: {
      title: "Image",
      subtitle: "Asset",
      imageUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320'%3E%3Cdefs%3E%3ClinearGradient id='img' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2322d3ee'/%3E%3Cstop offset='100%25' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='320' fill='url(%23img)'/%3E%3C/svg%3E",
    },
    todo: {
      title: "Todo",
      subtitle: "Task",
      text: "Mark this once validated.",
      checked: false,
    },
  };

  return defaults[kind];
}

function defaultNodeSize(kind: VoidspaceNodeKind): { width: number; height: number } {
  switch (kind) {
    case "code":
      return { width: 360, height: 260 };
    case "image":
      return { width: 380, height: 320 };
    case "text":
      return { width: 330, height: 240 };
    case "quote":
      return { width: 320, height: 220 };
    case "todo":
      return { width: 320, height: 200 };
    default:
      return { width: 320, height: 220 };
  }
}

function clampNodeWidth(value: number): number {
  return Math.min(Math.max(value, MIN_NODE_WIDTH), MAX_NODE_WIDTH);
}

function clampNodeHeight(value: number): number {
  return Math.min(Math.max(value, MIN_NODE_HEIGHT), MAX_NODE_HEIGHT);
}

function parseNumericSize(value: unknown, fallback: number): number {
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

function readNodeWidth(node: VoidspaceNode): number {
  return clampNodeWidth(
    parseNumericSize(node.style?.width, parseNumericSize(node.width, 320))
  );
}

function readNodeHeight(node: VoidspaceNode): number {
  return clampNodeHeight(
    parseNumericSize(node.style?.height, parseNumericSize(node.height, 220))
  );
}

function normalizeEdge(edge: VoidspaceEdge, theme: ThemeMode): VoidspaceEdge {
  const stroke = edgeColor(theme);

  return {
    ...edge,
    type: "smoothstep",
    animated: true,
    markerEnd: edgeMarker(theme),
    style: {
      ...edge.style,
      stroke,
      strokeWidth: 2.2,
    },
  };
}

function initialEdges(_theme: ThemeMode): VoidspaceEdge[] {
  return [];
}

function isNodeKind(value: unknown): value is VoidspaceNodeKind {
  return (
    typeof value === "string" &&
    VOIDSPACE_NODE_KINDS.includes(value as VoidspaceNodeKind)
  );
}

function parseWorkflowPayload(
  payload: unknown,
  theme: ThemeMode
): WorkflowSnapshot | null {
  try {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const parsed = payload as {
      nodes?: VoidspaceNode[];
      edges?: VoidspaceEdge[];
    };

    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return null;
    }

    const nodes = parsed.nodes.map((node, index) => {
      const kind = isNodeKind(node.type) ? node.type : "text";
      const fallback = defaultNodeData(kind);
      const size = defaultNodeSize(kind);

      return {
        ...node,
        id:
          typeof node.id === "string" && node.id.length > 0
            ? node.id
            : `${kind}-${index + 1}`,
        type: kind,
        selected: false,
        data: {
          ...fallback,
          ...node.data,
          onChange: undefined,
        },
        style: {
          ...(node.style ?? {}),
          width: clampNodeWidth(parseNumericSize(node.style?.width, size.width)),
          height: clampNodeHeight(
            parseNumericSize(node.style?.height, size.height)
          ),
        },
      } satisfies VoidspaceNode;
    });

    const edges = parsed.edges
      .filter((edge) => edge.source && edge.target)
      .map((edge, index) =>
        normalizeEdge(
          {
            ...edge,
            id:
              typeof edge.id === "string" && edge.id.length > 0
                ? edge.id
                : `edge-${index + 1}`,
            selected: false,
          },
          theme
        )
      );

    return { nodes, edges };
  } catch {
    return null;
  }
}

function cloneSnapshot(snapshot: WorkflowSnapshot): WorkflowSnapshot {
  return {
    nodes: snapshot.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: undefined,
      },
    })),
    edges: snapshot.edges.map((edge) => ({ ...edge })),
  };
}

function buildSnapshot(
  nodes: VoidspaceNode[],
  edges: VoidspaceEdge[]
): WorkflowSnapshot {
  return {
    nodes: nodes.map((node) => ({
      ...node,
      selected: false,
      data: {
        ...node.data,
        onChange: undefined,
      },
    })),
    edges: edges.map((edge) => ({
      ...edge,
      selected: false,
      type: "smoothstep",
      animated: true,
    })),
  };
}

function snapshotSignature(snapshot: WorkflowSnapshot): string {
  return JSON.stringify({
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      x: node.position.x,
      y: node.position.y,
      width: readNodeWidth(node),
      height: readNodeHeight(node),
      data: {
        title: node.data.title,
        subtitle: node.data.subtitle ?? null,
        text: node.data.text ?? null,
        code: node.data.code ?? null,
        imageUrl: node.data.imageUrl ?? null,
        checked: Boolean(node.data.checked),
      },
    })),
    edges: snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      label: typeof edge.label === "string" ? edge.label : "",
    })),
  });
}

function nextNodeCounter(nodes: VoidspaceNode[]): number {
  const max = nodes.reduce((currentMax, node) => {
    const match = node.id.match(/-(\d+)$/);
    if (!match) {
      return currentMax;
    }

    const next = Number(match[1]);
    return Number.isFinite(next) ? Math.max(currentMax, next) : currentMax;
  }, 1);

  return max + 1;
}

export default function VoidspacePage() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<VoidspaceContextMenu>(null);
  const [flowInstance, setFlowInstance] =
    useState<ReactFlowInstance<VoidspaceNode, VoidspaceEdge> | null>(null);
  const [historyMeta, setHistoryMeta] = useState({ undo: 0, redo: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nextNodeId = useRef(1);

  const initialSnapshot = useMemo(
    () => buildSnapshot(INITIAL_NODES, initialEdges("dark")),
    []
  );
  const currentSnapshotRef = useRef<WorkflowSnapshot>(
    cloneSnapshot(initialSnapshot)
  );
  const currentSignatureRef = useRef<string>(snapshotSignature(initialSnapshot));
  const undoStackRef = useRef<WorkflowSnapshot[]>([]);
  const redoStackRef = useRef<WorkflowSnapshot[]>([]);
  const skipHistoryRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const lastPersistedSignatureRef = useRef<string>(currentSignatureRef.current);

  const [nodes, setNodes, onNodesChange] = useNodesState<VoidspaceNode>(
    INITIAL_NODES
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<VoidspaceEdge>(
    initialEdges("dark")
  );

  const updateHistoryMeta = useCallback(() => {
    setHistoryMeta({
      undo: undoStackRef.current.length,
      redo: redoStackRef.current.length,
    });
  }, []);

  const syncNextNodeCounter = useCallback((nextNodes: VoidspaceNode[]) => {
    nextNodeId.current = Math.max(nextNodeId.current, nextNodeCounter(nextNodes));
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<VoidspaceNodeBaseData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...patch,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: updateNodeData,
        },
      })),
    [nodes, updateNodeData]
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? null,
    [nodes]
  );
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.selected) ?? null,
    [edges]
  );

  const activeEdgeColor = useMemo(() => edgeColor(theme), [theme]);
  const activeEdgeMarker = useMemo(() => edgeMarker(theme), [theme]);

  const defaultEdgeOptions = useMemo<DefaultEdgeOptions>(
    () => ({
      type: "smoothstep",
      animated: true,
      markerEnd: activeEdgeMarker,
      style: {
        stroke: activeEdgeColor,
        strokeWidth: 2.2,
      },
    }),
    [activeEdgeColor, activeEdgeMarker]
  );

  const applySnapshot = useCallback(
    (snapshot: WorkflowSnapshot) => {
      const parsed = parseWorkflowPayload(snapshot, theme);
      if (!parsed) {
        return;
      }

      currentSnapshotRef.current = cloneSnapshot(parsed);
      currentSignatureRef.current = snapshotSignature(parsed);
      skipHistoryRef.current = true;

      setNodes(parsed.nodes);
      setEdges(parsed.edges);
      syncNextNodeCounter(parsed.nodes);
      setContextMenu(null);
    },
    [setEdges, setNodes, syncNextNodeCounter, theme]
  );

  const persistWorkflow = useCallback(
    async (snapshot: WorkflowSnapshot, silent: boolean): Promise<boolean> => {
      setIsSaving(true);

      try {
        const response = await fetch(WORKFLOW_API_ENDPOINT, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snapshot),
        });

        if (!response.ok) {
          if (!silent) {
            setToastMessage("Save failed");
          }
          return false;
        }

        const now = new Date().toISOString();
        setLastSavedAt(now);
        if (!silent) {
          setToastMessage("Workflow saved");
        }
        return true;
      } catch {
        if (!silent) {
          setToastMessage("Save failed");
        }
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    setEdges((current) => current.map((edge) => normalizeEdge(edge, theme)));
  }, [setEdges, theme]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    const nextSnapshot = buildSnapshot(nodes, edges);
    const nextSignature = snapshotSignature(nextSnapshot);

    if (nextSignature === currentSignatureRef.current) {
      if (skipHistoryRef.current) {
        skipHistoryRef.current = false;
      }
      return;
    }

    if (skipHistoryRef.current) {
      currentSnapshotRef.current = cloneSnapshot(nextSnapshot);
      currentSignatureRef.current = nextSignature;
      skipHistoryRef.current = false;
      return;
    }

    undoStackRef.current = [
      ...undoStackRef.current,
      cloneSnapshot(currentSnapshotRef.current),
    ].slice(-HISTORY_LIMIT);
    redoStackRef.current = [];
    currentSnapshotRef.current = cloneSnapshot(nextSnapshot);
    currentSignatureRef.current = nextSignature;
    updateHistoryMeta();
  }, [edges, nodes, updateHistoryMeta]);

  useEffect(() => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const snapshot = buildSnapshot(nodes, edges);
    const signature = snapshotSignature(snapshot);
    if (signature === lastPersistedSignatureRef.current) {
      return;
    }

    autosaveTimerRef.current = window.setTimeout(async () => {
      const ok = await persistWorkflow(snapshot, true);
      if (ok) {
        lastPersistedSignatureRef.current = signature;
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [edges, nodes, persistWorkflow]);

  const isValidConnection = useCallback<
    NonNullable<ReactFlowProps<VoidspaceNode, VoidspaceEdge>["isValidConnection"]>
  >(
    (connection) => {
      if (!connection.source || !connection.target) {
        return false;
      }

      if (connection.source === connection.target) {
        return false;
      }

      const duplicate = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          (edge.sourceHandle ?? null) === (connection.sourceHandle ?? null) &&
          (edge.targetHandle ?? null) === (connection.targetHandle ?? null)
      );

      if (duplicate) {
        return false;
      }

      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) {
        setToastMessage("Invalid connection");
        return;
      }

      setEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            markerEnd: edgeMarker(theme),
            style: {
              stroke: edgeColor(theme),
              strokeWidth: 2.2,
            },
          },
          current
        )
      );
    },
    [isValidConnection, setEdges, theme]
  );

  const clearSelection = useCallback(() => {
    setNodes((current) =>
      current.map((node) =>
        node.selected ? { ...node, selected: false } : node
      )
    );
    setEdges((current) =>
      current.map((edge) =>
        edge.selected ? { ...edge, selected: false } : edge
      )
    );
  }, [setEdges, setNodes]);

  const addNode = useCallback(
    (kind: VoidspaceNodeKind) => {
      const id = `${kind}-${nextNodeId.current++}`;
      const stagger = (nextNodeId.current % 6) * 26;

      const fallbackPosition = {
        x: 40 + stagger,
        y: 40 + stagger * 0.6,
      };

      const position =
        flowInstance && canvasRef.current
          ? flowInstance.screenToFlowPosition({
              x: canvasRef.current.getBoundingClientRect().left + 240 + stagger,
              y:
                canvasRef.current.getBoundingClientRect().top +
                180 +
                stagger * 0.6,
            })
          : fallbackPosition;

      const newNode: VoidspaceNode = {
        id,
        type: kind,
        position,
        selected: true,
        data: defaultNodeData(kind),
        style: defaultNodeSize(kind),
      };

      setNodes((current) => [
        ...current.map((node) =>
          node.selected ? { ...node, selected: false } : node
        ),
        newNode,
      ]);
      setEdges((current) =>
        current.map((edge) =>
          edge.selected ? { ...edge, selected: false } : edge
        )
      );
      setContextMenu(null);
    },
    [flowInstance, setEdges, setNodes]
  );

  const onNodesDelete = useCallback(
    (deletedNodes: VoidspaceNode[]) => {
      if (deletedNodes.length === 0) {
        return;
      }

      const deletedNodeIds = new Set(deletedNodes.map((node) => node.id));
      setEdges((current) =>
        current.filter(
          (edge) =>
            !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target)
        )
      );
      clearSelection();
      setContextMenu(null);
    },
    [clearSelection, setEdges]
  );

  const onEdgesDelete = useCallback(() => {
    clearSelection();
    setContextMenu(null);
  }, [clearSelection]);

  const onNodeContextMenu = useCallback<NodeMouseHandler<VoidspaceNode>>(
    (event, node) => {
      event.preventDefault();
      setContextMenu({
        id: node.id,
        type: "node",
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback<EdgeMouseHandler<VoidspaceEdge>>(
    (event, edge) => {
      event.preventDefault();
      setContextMenu({
        id: edge.id,
        type: "edge",
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback<
    NonNullable<ReactFlowProps<VoidspaceNode, VoidspaceEdge>["onPaneContextMenu"]>
  >((event) => {
    event.preventDefault();
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const deleteFromContextMenu = useCallback(() => {
    if (!contextMenu) {
      return;
    }

    if (contextMenu.type === "node") {
      setNodes((current) =>
        current
          .filter((node) => node.id !== contextMenu.id)
          .map((node) => (node.selected ? { ...node, selected: false } : node))
      );
      setEdges((current) =>
        current
          .filter(
            (edge) =>
              edge.source !== contextMenu.id && edge.target !== contextMenu.id
          )
          .map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
      );
    } else {
      setEdges((current) =>
        current
          .filter((edge) => edge.id !== contextMenu.id)
          .map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
      );
      clearSelection();
    }

    setContextMenu(null);
  }, [clearSelection, contextMenu, setEdges, setNodes]);

  const saveWorkflow = useCallback(async () => {
    const snapshot = buildSnapshot(nodes, edges);
    const saved = await persistWorkflow(snapshot, false);
    if (saved) {
      lastPersistedSignatureRef.current = snapshotSignature(snapshot);
    }
  }, [edges, nodes, persistWorkflow]);

  const loadWorkflow = useCallback(async () => {
    try {
      const response = await fetch(WORKFLOW_API_ENDPOINT, {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 404) {
        setToastMessage("No saved workflow");
        return;
      }

      if (!response.ok) {
        setToastMessage("Load failed");
        return;
      }

      const payload: unknown = await response.json();
      const parsed = parseWorkflowPayload(payload, theme);
      if (!parsed) {
        setToastMessage("Saved workflow is invalid");
        return;
      }

      undoStackRef.current = [];
      redoStackRef.current = [];
      updateHistoryMeta();
      applySnapshot(parsed);
      lastPersistedSignatureRef.current = snapshotSignature(parsed);
      setLastSavedAt(new Date().toISOString());
      setToastMessage("Workflow loaded");

      window.requestAnimationFrame(() => {
        flowInstance?.fitView({ padding: 0.18, duration: 280 });
      });
    } catch {
      setToastMessage("Load failed");
    }
  }, [applySnapshot, flowInstance, theme, updateHistoryMeta]);

  const undo = useCallback(() => {
    const previous = undoStackRef.current.pop();
    if (!previous) {
      return;
    }

    redoStackRef.current = [
      ...redoStackRef.current,
      cloneSnapshot(currentSnapshotRef.current),
    ].slice(-HISTORY_LIMIT);
    updateHistoryMeta();
    applySnapshot(previous);
    setToastMessage("Undo");
  }, [applySnapshot, updateHistoryMeta]);

  const redo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) {
      return;
    }

    undoStackRef.current = [
      ...undoStackRef.current,
      cloneSnapshot(currentSnapshotRef.current),
    ].slice(-HISTORY_LIMIT);
    updateHistoryMeta();
    applySnapshot(next);
    setToastMessage("Redo");
  }, [applySnapshot, updateHistoryMeta]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isModifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isModifier && key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      if (isModifier && key === "z") {
        event.preventDefault();
        undo();
        return;
      }

      if (isModifier && key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  const updateSelectedNodeData = useCallback(
    (patch: Partial<VoidspaceNodeBaseData>) => {
      if (!selectedNode) {
        return;
      }
      updateNodeData(selectedNode.id, patch);
    },
    [selectedNode, updateNodeData]
  );

  const updateSelectedNodeSize = useCallback(
    (width: number, height: number) => {
      if (!selectedNode) {
        return;
      }

      const nextWidth = clampNodeWidth(width);
      const nextHeight = clampNodeHeight(height);

      setNodes((current) =>
        current.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                style: {
                  ...(node.style ?? {}),
                  width: nextWidth,
                  height: nextHeight,
                },
              }
            : node
        )
      );
    },
    [selectedNode, setNodes]
  );

  const updateSelectedEdgeLabel = useCallback(
    (label: string) => {
      if (!selectedEdge) {
        return;
      }

      setEdges((current) =>
        current.map((edge) =>
          edge.id === selectedEdge.id
            ? {
                ...edge,
                label,
              }
            : edge
        )
      );
    },
    [selectedEdge, setEdges]
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const onInit = useCallback(
    (instance: ReactFlowInstance<VoidspaceNode, VoidspaceEdge>) => {
      setFlowInstance(instance);
    },
    []
  );

  return (
    <VoidspaceCanvas
      theme={theme}
      nodes={nodesWithHandlers}
      edges={edges}
      canvasRef={canvasRef}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionColor={activeEdgeColor}
      toastMessage={toastMessage}
      contextMenu={contextMenu}
      canUndo={historyMeta.undo > 0}
      canRedo={historyMeta.redo > 0}
      isSaving={isSaving}
      lastSavedAt={lastSavedAt}
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      onToggleTheme={toggleTheme}
      onInit={onInit}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onAddNode={addNode}
      onSave={saveWorkflow}
      onLoad={loadWorkflow}
      onUndo={undo}
      onRedo={redo}
      onPaneClick={onPaneClick}
      onPaneContextMenu={onPaneContextMenu}
      onNodeContextMenu={onNodeContextMenu}
      onEdgeContextMenu={onEdgeContextMenu}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onContextDelete={deleteFromContextMenu}
      onSelectedNodeChange={updateSelectedNodeData}
      onSelectedNodeResize={updateSelectedNodeSize}
      onSelectedEdgeLabelChange={updateSelectedEdgeLabel}
      isValidConnection={isValidConnection}
    />
  );
}
