import { NextRequest, NextResponse } from "next/server";

import {
  isValidWorkflowId,
  isWorkflowPayload,
  readWorkflow,
  writeWorkflow,
} from "@/lib/workflow-store";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = context.params;

  if (!isValidWorkflowId(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  try {
    const workflow = await readWorkflow(id);
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to read workflow" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = context.params;

  if (!isValidWorkflowId(id)) {
    return NextResponse.json({ error: "Invalid workflow id" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isWorkflowPayload(payload)) {
    return NextResponse.json(
      { error: "Body must include nodes[] and edges[]" },
      { status: 400 }
    );
  }

  try {
    const saved = await writeWorkflow(id, payload);
    return NextResponse.json(saved, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save workflow" },
      { status: 500 }
    );
  }
}
