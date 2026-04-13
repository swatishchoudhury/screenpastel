"use client";
import type React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

const aspectRatios = [
  { label: "Auto", value: "auto" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:3 (Classic)", value: "4:3" },
  { label: "16:9 (Widescreen)", value: "16:9" },
  { label: "9:16 (Vertical)", value: "9:16" },
];

export default function StylingControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Dimensions & Size</h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80"
                >
                  {aspectRatios.find(r => r.value === state.aspectRatio)?.label || "Auto"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                {aspectRatios.map((ratio) => (
                  <DropdownMenuItem
                    key={ratio.value}
                    onClick={() => setState((prev) => ({ ...prev, aspectRatio: ratio.value }))}
                  >
                    {ratio.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Slider
            label="Scale"
            value={state.scale}
            onChange={(v: number) => setState((prev) => ({ ...prev, scale: v }))}
            min={0.5}
            max={1.5}
            step={0.01}
            snapPoints={[0.5, 0.75, 1, 1.25, 1.5]}
            snapThreshold={0.015}
          />
          <Slider
            label="Padding"
            value={state.padding}
            onChange={(v: number) => setState((prev) => ({ ...prev, padding: v }))}
            min={0}
            max={200}
            unit="px"
            snapPoints={[0, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200]}
            snapThreshold={2}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Positioning</h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Position X"
            value={state.positionX}
            onChange={(v: number) => setState((prev) => ({ ...prev, positionX: v }))}
            min={-1000}
            max={1000}
            unit="px"
            snapPoints={[0]}
            snapThreshold={8}
          />
          <Slider
            label="Position Y"
            value={state.positionY}
            onChange={(v: number) => setState((prev) => ({ ...prev, positionY: v }))}
            min={-1000}
            max={1000}
            unit="px"
            snapPoints={[0]}
            snapThreshold={8}
          />
          <Slider
            label="Rotation"
            value={state.rotation}
            onChange={(v: number) => setState((prev) => ({ ...prev, rotation: v }))}
            min={-360}
            max={360}
            unit="°"
            snapPoints={[0, 45, 90, 135, 180, 270, 360, -45, -90, -135, -180, -270, -360]}
            snapThreshold={3}
          />
        </div>
      </div>
    </div>
  );
}