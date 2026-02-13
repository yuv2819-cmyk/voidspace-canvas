import { NodeProps } from "@xyflow/react";

import type { VoidspaceNode } from "../types";
import BaseNodeCard from "./BaseNodeCard";

export default function TextNode({
  id,
  data,
  selected,
}: NodeProps<VoidspaceNode>) {
  return (
    <BaseNodeCard
      title={data.title}
      subtitle={data.subtitle}
      accentClassName="bg-gradient-to-r from-cyan-500/30 to-blue-500/15"
      selected={selected}
    >
      <textarea
        value={data.text ?? ""}
        onChange={(event) => data.onChange?.(id, { text: event.target.value })}
        className="nodrag nopan nowheel min-h-[96px] w-full resize-y rounded-md border border-violet-200 bg-white px-2 py-1.5 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0b1022] dark:text-slate-100"
        placeholder="Write your node content..."
      />
    </BaseNodeCard>
  );
}
