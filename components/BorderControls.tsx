"use client";

import type React from "react";

import type { EditorState } from "../lib/types";
import ColorSwatch from "./ColorSwatch";
import Slider from "./Slider";

export default function BorderControls({
  state,
  setState,
  commit,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  commit: (update: EditorState | ((prev: EditorState) => EditorState)) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Border Outline
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Width"
            value={state.border.width}
            onChange={(v: number) =>
              setState((prev) => ({
                ...prev,
                border: { ...prev.border, width: v },
              }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({
                ...prev,
                border: { ...prev.border, width: v },
              }))
            }
            min={0}
            max={20}
            unit="px"
          />
          <ColorSwatch
            label="Border Color"
            value={state.border.color}
            onChange={(color) =>
              commit((prev) => ({
                ...prev,
                border: { ...prev.border, color },
              }))
            }
          />
          <Slider
            label="Border Radius"
            value={state.borderRadius}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, borderRadius: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, borderRadius: v }))
            }
            min={0}
            max={40}
            unit="px"
          />
        </div>
      </div>
    </div>
  );
}
