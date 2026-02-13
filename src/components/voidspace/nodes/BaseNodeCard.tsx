import { Handle, NodeResizer, Position } from "@xyflow/react";
import type { ReactNode } from "react";

type BaseNodeCardProps = {
  title: string;
  subtitle?: string;
  accentClassName: string;
  selected?: boolean;
  children: ReactNode;
};

export default function BaseNodeCard({
  title,
  subtitle,
  accentClassName,
  selected,
  children,
}: BaseNodeCardProps) {
  return (
    <article
      className={`group relative flex h-full min-h-[160px] min-w-[220px] w-full flex-col rounded-xl border bg-white text-slate-900 shadow-[0_10px_22px_rgba(41,27,74,0.15)] transition duration-200 hover:scale-[1.01] hover:border-fuchsia-400 dark:bg-[#0b1022] dark:text-slate-100 dark:shadow-[0_12px_26px_rgba(8,12,27,0.52)] dark:hover:border-cyan-300 ${
        selected
          ? "border-fuchsia-400 ring-2 ring-fuchsia-300/70 dark:border-cyan-300 dark:ring-cyan-300/60 dark:shadow-neon-md"
          : "border-violet-200 dark:border-slate-700/80"
      }`}
    >
      <NodeResizer
        isVisible={Boolean(selected)}
        minWidth={220}
        minHeight={150}
        maxWidth={980}
        maxHeight={760}
        lineClassName="!border-cyan-300/80"
        handleClassName="!h-2.5 !w-2.5 !border !border-cyan-200 !bg-[#0f1737]"
      />

      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!h-3 !w-3 !border !border-fuchsia-300 !bg-white dark:!border-cyan-300 dark:!bg-[#0b1120]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!h-3 !w-3 !border !border-fuchsia-300 !bg-white dark:!border-cyan-300 dark:!bg-[#0b1120]"
      />

      <header
        className={`rounded-t-xl border-b border-violet-200 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-900 dark:border-slate-700 dark:text-cyan-100 ${accentClassName}`}
      >
        {title}
      </header>

      <div className="flex-1 overflow-hidden px-3 py-3 text-sm">
        {subtitle ? (
          <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!h-3 !w-3 !border !border-fuchsia-300 !bg-white dark:!border-cyan-300 dark:!bg-[#0b1120]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!h-3 !w-3 !border !border-fuchsia-300 !bg-white dark:!border-cyan-300 dark:!bg-[#0b1120]"
      />
    </article>
  );
}
