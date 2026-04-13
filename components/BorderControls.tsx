"use client";

import type React from "react";

import type { EditorState } from "../lib/types";
import Slider from "./Slider";
import ColorSwatch from "./ColorSwatch";

export default function BorderControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Border Outline</h3>
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
            min={0}
            max={20}
            unit="px"
          />
          <ColorSwatch
              label="Border Color"
              value={state.border.color}
              onChange={(color) =>
                setState((prev) => ({
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
            min={0}
            max={40}
            unit="px"
          />
        </div>
      </div>
    </div>
  );
}
