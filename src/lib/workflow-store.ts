import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type WorkflowDocument = {
  id: string;
  nodes: unknown[];
  edges: unknown[];
  updatedAt: string;
};

type WorkflowPayload = {
  nodes: unknown[];
  edges: unknown[];
};

const WORKFLOW_DIR = join(process.cwd(), ".voidspace", "workflows");

function workflowPath(id: string): string {
  return join(WORKFLOW_DIR, `${id}.json`);
}

export function isValidWorkflowId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

export function isWorkflowPayload(value: unknown): value is WorkflowPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return Array.isArray(payload.nodes) && Array.isArray(payload.edges);
}

export async function readWorkflow(id: string): Promise<WorkflowDocument | null> {
  try {
    const raw = await readFile(workflowPath(id), "utf8");
    const parsed = JSON.parse(raw) as Partial<WorkflowDocument>;

    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return null;
    }

    return {
      id,
      nodes: parsed.nodes,
      edges: parsed.edges,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeWorkflow(
  id: string,
  payload: WorkflowPayload
): Promise<WorkflowDocument> {
  await mkdir(WORKFLOW_DIR, { recursive: true });

  const document: WorkflowDocument = {
    id,
    nodes: payload.nodes,
    edges: payload.edges,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(workflowPath(id), JSON.stringify(document, null, 2), "utf8");
  return document;
}
