import { NodeProps } from "@xyflow/react";

import type { VoidspaceNode } from "../types";
import BaseNodeCard from "./BaseNodeCard";

export default function QuoteNode({
  id,
  data,
  selected,
}: NodeProps<VoidspaceNode>) {
  return (
    <BaseNodeCard
      title={data.title}
      subtitle={data.subtitle}
      accentClassName="bg-gradient-to-r from-fuchsia-500/35 to-violet-500/20"
      selected={selected}
    >
      <textarea
        value={data.text ?? ""}
        onChange={(event) => data.onChange?.(id, { text: event.target.value })}
        className="nodrag nopan nowheel min-h-[88px] w-full resize-y rounded-md border border-fuchsia-300/70 bg-white px-2 py-1.5 text-sm italic leading-relaxed text-slate-700 outline-none transition focus:border-fuchsia-400 dark:border-fuchsia-800/70 dark:bg-[#0b1022] dark:text-slate-100"
        placeholder="Add a quote..."
      />
    </BaseNodeCard>
  );
}
