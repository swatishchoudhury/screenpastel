"use client";

import type React from "react";

import { Label } from "@/components/ui/label";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

export default function BorderControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl">
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
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Border Color</Label>
        <input
          type="color"
          value={state.border.color}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              border: { ...prev.border, color: e.target.value },
            }))
          }
          className="w-16 h-8 rounded-none cursor-pointer"
        />
      </div>
    </div>
  );
}
