import { NodeProps } from "@xyflow/react";

import type { VoidspaceNode } from "../types";
import BaseNodeCard from "./BaseNodeCard";

export default function TodoNode({
  id,
  data,
  selected,
}: NodeProps<VoidspaceNode>) {
  return (
    <BaseNodeCard
      title={data.title}
      subtitle={data.subtitle}
      accentClassName="bg-gradient-to-r from-violet-500/35 to-blue-500/20"
      selected={selected}
    >
      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
        <input
          type="checkbox"
          checked={Boolean(data.checked)}
          onChange={(event) =>
            data.onChange?.(id, { checked: event.target.checked })
          }
          className="nodrag nopan h-4 w-4 rounded border-slate-400 bg-white accent-cyan-400 dark:bg-slate-800"
        />
        <input
          type="text"
          value={data.text ?? ""}
          onChange={(event) => data.onChange?.(id, { text: event.target.value })}
          className={`nodrag nopan w-full rounded-md border border-violet-200 bg-white px-2 py-1 text-sm outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-[#0b1022] dark:text-slate-100 ${
            data.checked ? "line-through opacity-75" : ""
          }`}
          placeholder="Add a todo item..."
        />
      </label>
    </BaseNodeCard>
  );
}
