import { NodeProps } from "@xyflow/react";

import type { VoidspaceNode } from "../types";
import BaseNodeCard from "./BaseNodeCard";

export default function CodeNode({
  id,
  data,
  selected,
}: NodeProps<VoidspaceNode>) {
  return (
    <BaseNodeCard
      title={data.title}
      subtitle={data.subtitle}
      accentClassName="bg-gradient-to-r from-emerald-500/35 to-cyan-400/20"
      selected={selected}
    >
      <textarea
        value={data.code ?? ""}
        onChange={(event) => data.onChange?.(id, { code: event.target.value })}
        className="nodrag nopan nowheel min-h-[110px] w-full resize-y rounded-md border border-emerald-400/45 bg-slate-950 p-2 font-mono text-xs leading-relaxed text-emerald-200 outline-none transition focus:border-cyan-400"
        placeholder="const output = input;"
      />
    </BaseNodeCard>
  );
}
