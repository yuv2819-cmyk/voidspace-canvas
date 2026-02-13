/* eslint-disable @next/next/no-img-element */
import { NodeProps } from "@xyflow/react";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

import type { VoidspaceNode } from "../types";
import BaseNodeCard from "./BaseNodeCard";

export default function ImageNode({
  id,
  data,
  selected,
}: NodeProps<VoidspaceNode>) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [data.imageUrl]);

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          data.onChange?.(id, { imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [data, id]
  );

  const imageSrc = (data.imageUrl ?? "").trim();
  const showImage = imageSrc.length > 0 && !broken;

  return (
    <BaseNodeCard
      title={data.title}
      subtitle={data.subtitle}
      accentClassName="bg-gradient-to-r from-pink-500/35 to-fuchsia-500/20"
      selected={selected}
    >
      <div className="space-y-2">
        <input
          type="url"
          value={data.imageUrl ?? ""}
          onChange={(event) =>
            data.onChange?.(id, { imageUrl: event.target.value })
          }
          placeholder="https://... or paste data URL"
          className="nodrag nopan nowheel w-full rounded-md border border-fuchsia-300/70 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-cyan-400 dark:border-fuchsia-800/70 dark:bg-[#0b1022] dark:text-slate-100"
        />
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="nodrag nopan nowheel w-full cursor-pointer text-[11px] file:mr-2 file:rounded file:border file:border-cyan-300 file:bg-cyan-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.08em] file:text-cyan-700 dark:file:border-cyan-700 dark:file:text-cyan-200"
        />

        {showImage ? (
          <img
            src={imageSrc}
            alt={data.title}
            onError={() => setBroken(true)}
            className="h-36 w-full rounded-md border border-fuchsia-400/30 object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed border-fuchsia-400/35 bg-[#0a0f22] text-xs uppercase tracking-[0.08em] text-fuchsia-200/85">
            No image preview
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
}
