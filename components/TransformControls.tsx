"use client";
import { ChevronDown, Crop, FlipHorizontal, FlipVertical } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

const PRESETS = [
  {
    name: "Default",
    values: { perspective: 1000, rotateX: 0, rotateY: 0, rotateZ: 0 },
  },
  {
    name: "Subtle Left",
    values: { perspective: 1000, rotateX: 3, rotateY: -10, rotateZ: 0 },
  },
  {
    name: "Subtle Right",
    values: { perspective: 1000, rotateX: -3, rotateY: 10, rotateZ: 0 },
  },
  {
    name: "Dramatic Left",
    values: { perspective: 1000, rotateX: 5, rotateY: -20, rotateZ: 0 },
  },
  {
    name: "Dramatic Right",
    values: { perspective: 1000, rotateX: -5, rotateY: 20, rotateZ: 0 },
  },
  {
    name: "Top Left",
    values: { perspective: 1200, rotateX: 25, rotateY: -10, rotateZ: -15 },
  },
  {
    name: "Top Right",
    values: { perspective: 1200, rotateX: 25, rotateY: 10, rotateZ: 15 },
  },
  {
    name: "Front Depth",
    values: { perspective: 1000, rotateX: 15, rotateY: 0, rotateZ: 0 },
  },
  {
    name: "Side Depth",
    values: { perspective: 1000, rotateX: 0, rotateY: -15, rotateZ: 0 },
  },
];

const aspectRatios = [
  { label: "Auto", value: "auto" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:3 (Classic)", value: "4:3" },
  { label: "16:9 (Widescreen)", value: "16:9" },
  { label: "9:16 (Vertical)", value: "9:16" },
];

export default function TransformControls({
  state,
  setState,
  commit,
  onCropClick,
  isCropDisabled,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  commit: (update: EditorState | ((prev: EditorState) => EditorState)) => void;
  onCropClick: () => void;
  isCropDisabled: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Transform
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCropClick}
              disabled={isCropDisabled}
              className="flex-1 justify-center gap-2 bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80 text-xs"
            >
              <Crop className="w-3.5 h-3.5" />
              Crop Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`w-9 flex-shrink-0 bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80 transition-colors ${state.flipX ? "bg-accent text-accent-foreground border-primary/50" : ""}`}
              title="Flip Horizontal"
              onClick={() =>
                commit((prev) => ({ ...prev, flipX: !prev.flipX }))
              }
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`w-9 flex-shrink-0 bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80 transition-colors ${state.flipY ? "bg-accent text-accent-foreground border-primary/50" : ""}`}
              title="Flip Vertical"
              onClick={() =>
                commit((prev) => ({ ...prev, flipY: !prev.flipY }))
              }
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Aspect Ratio
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80"
                >
                  {aspectRatios.find((r) => r.value === state.aspectRatio)
                    ?.label || "Auto"}
                  <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                {aspectRatios.map((ratio) => (
                  <DropdownMenuItem
                    key={ratio.value}
                    onClick={() =>
                      commit((prev) => ({ ...prev, aspectRatio: ratio.value }))
                    }
                  >
                    {ratio.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Slider
            label="Scale"
            value={Number(state.scale.toFixed(2))}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, scale: v }))
            }
            onCommit={(v: number) => commit((prev) => ({ ...prev, scale: v }))}
            min={0.5}
            max={1.5}
            step={0.01}
            snapPoints={[0.5, 0.75, 1, 1.25, 1.5]}
            snapThreshold={0.015}
          />
          <Slider
            label="Padding"
            value={state.padding}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, padding: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, padding: v }))
            }
            min={0}
            max={200}
            unit="px"
            snapPoints={[0, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200]}
            snapThreshold={2}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Positioning
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Position X"
            value={state.positionX}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, positionX: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, positionX: v }))
            }
            min={-1000}
            max={1000}
            unit="px"
            snapPoints={[0]}
            snapThreshold={8}
          />
          <Slider
            label="Position Y"
            value={state.positionY}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, positionY: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, positionY: v }))
            }
            min={-1000}
            max={1000}
            unit="px"
            snapPoints={[0]}
            snapThreshold={8}
          />
          <Slider
            label="Rotation"
            value={state.rotation}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, rotation: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, rotation: v }))
            }
            min={-360}
            max={360}
            unit="°"
            snapPoints={[
              0, 45, 90, 135, 180, 270, 360, -45, -90, -135, -180, -270, -360,
            ]}
            snapThreshold={3}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-1">
          <h3 className="text-sm font-medium text-foreground/80">
            3D Transform
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              commit((prev) => ({
                ...prev,
                perspective: 1000,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
              }))
            }
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => commit((prev) => ({ ...prev, ...preset.values }))}
              className={`group relative flex flex-col items-center p-1.5 rounded-lg border transition-all hover:bg-accent/50 ${
                state.rotateX === preset.values.rotateX &&
                state.rotateY === preset.values.rotateY &&
                state.rotateZ === preset.values.rotateZ
                  ? "bg-accent border-primary/50 ring-1 ring-primary/20"
                  : "bg-secondary/30 border-border/50 hover:border-border"
              }`}
              title={preset.name}
            >
              <div
                className="w-full aspect-square bg-foreground/5 rounded-sm shadow-inner transition-transform group-hover:scale-105 overflow-hidden flex items-center justify-center"
                style={{
                  perspective: "80px",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="w-1/2 h-1/2 bg-foreground/20 rounded-[2px] shadow-sm"
                  style={{
                    transform: `rotateX(${preset.values.rotateX}deg) rotateY(${preset.values.rotateY}deg) rotateZ(${preset.values.rotateZ}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Rotate X"
            value={Math.round(state.rotateX)}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, rotateX: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, rotateX: v }))
            }
            min={-90}
            max={90}
            unit="°"
            snapPoints={[0]}
            snapThreshold={3}
          />
          <Slider
            label="Rotate Y"
            value={Math.round(state.rotateY)}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, rotateY: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, rotateY: v }))
            }
            min={-90}
            max={90}
            unit="°"
            snapPoints={[0]}
            snapThreshold={3}
          />
          <Slider
            label="Rotate Z"
            value={Math.round(state.rotateZ)}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, rotateZ: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, rotateZ: v }))
            }
            min={-90}
            max={90}
            unit="°"
            snapPoints={[0]}
            snapThreshold={3}
          />
        </div>
      </div>
    </div>
  );
}
