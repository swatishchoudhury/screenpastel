"use client";

import type React from "react";

import { Label } from "@/components/ui/label";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

export default function ShadowControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
      <Slider
        label="Offset X"
        value={state.shadows[0].offsetX}
        onChange={(v: number) =>
          setState((prev) => ({
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
        min={0}
        max={100}
        unit="px"
      />
      <Slider
        label="Opacity"
        value={state.shadows[0].opacity}
        onChange={(v: number) =>
          setState((prev) => ({
            ...prev,
            shadows: [{ ...prev.shadows[0], opacity: v }],
          }))
        }
        min={0}
        max={1}
        step={0.01}
      />
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Shadow Color</Label>
        <input
          type="color"
          value={state.shadows[0].color}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              shadows: [{ ...prev.shadows[0], color: e.target.value }],
            }))
          }
          className="w-16 h-8 rounded-none cursor-pointer"
        />
      </div>
    </div>
  );
}
