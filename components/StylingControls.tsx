"use client";
import type React from "react";
import { Label } from "@/components/ui/label";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

export default function StylingControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
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
        <Slider
          label="Padding"
          value={state.padding}
          onChange={(v: number) => setState((prev) => ({ ...prev, padding: v }))}
          min={0}
          max={200}
          unit="px"
        />
        <Slider
          label="Scale"
          value={state.scale}
          onChange={(v: number) => setState((prev) => ({ ...prev, scale: v }))}
          min={0.5}
          max={1.5}
          step={0.01}
        />
        <Slider
          label="Rotation"
          value={state.rotation}
          onChange={(v: number) => setState((prev) => ({ ...prev, rotation: v }))}
          min={-15}
          max={15}
          unit="°"
        />
        <Slider
          label="Tint Opacity"
          value={state.backgroundTintOpacity}
          onChange={(v: number) => setState((prev) => ({ ...prev, backgroundTintOpacity: v }))}
          min={0}
          max={1}
          step={0.01}
        />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tint Color</Label>
          <input
            type="color"
            value={state.backgroundTintColor}
            onChange={(e) =>
              setState((prev) => ({ ...prev, backgroundTintColor: e.target.value }))
            }
            className="w-16 h-8 rounded-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}