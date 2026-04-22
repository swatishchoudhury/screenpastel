"use client";

import type React from "react";

import type { EditorState } from "../lib/types";
import ColorSwatch from "./ColorSwatch";
import Slider from "./Slider";

export default function ShadowControls({
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
          Size & Position
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Offset X"
            value={state.shadows[0].offsetX}
            onChange={(v: number) =>
              setState((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], offsetX: v }],
              }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], offsetX: v }],
              }))
            }
            min={-100}
            max={100}
            unit="px"
          />
          <Slider
            label="Offset Y"
            value={state.shadows[0].offsetY}
            onChange={(v: number) =>
              setState((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], offsetY: v }],
              }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], offsetY: v }],
              }))
            }
            min={-100}
            max={100}
            unit="px"
          />
          <Slider
            label="Blur"
            value={state.shadows[0].blur}
            onChange={(v: number) =>
              setState((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], blur: v }],
              }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], blur: v }],
              }))
            }
            min={0}
            max={100}
            unit="px"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Appearance
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Opacity"
            value={state.shadows[0].opacity}
            onChange={(v: number) =>
              setState((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], opacity: v }],
              }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], opacity: v }],
              }))
            }
            min={0}
            max={1}
            step={0.01}
          />
          <ColorSwatch
            label="Shadow Color"
            value={state.shadows[0].color}
            onChange={(color) =>
              commit((prev) => ({
                ...prev,
                shadows: [{ ...prev.shadows[0], color }],
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
