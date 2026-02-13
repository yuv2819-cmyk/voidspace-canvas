import { Edge, Node } from "@xyflow/react";

export type VoidspaceNodeKind = "text" | "quote" | "code" | "image" | "todo";

export type VoidspaceNodeBaseData = {
  title: string;
  subtitle?: string;
  text?: string;
  code?: string;
  imageUrl?: string;
  checked?: boolean;
};

export type VoidspaceNodeData = VoidspaceNodeBaseData & {
  onChange?: (
    nodeId: string,
    patch: Partial<VoidspaceNodeBaseData>
  ) => void;
};

export type VoidspaceNode = Node<VoidspaceNodeData, VoidspaceNodeKind>;
export type VoidspaceEdge = Edge;

export const VOIDSPACE_NODE_KINDS: VoidspaceNodeKind[] = [
  "text",
  "quote",
  "code",
  "image",
  "todo",
];
