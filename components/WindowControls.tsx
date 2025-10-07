"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FRAMES } from "../lib/data";
import type { EditorState } from "../lib/types";
import Slider from "./Slider";

export default function WindowControls({
  state,
  setState,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end gap-6 flex-wrap">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Frame Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-between bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80"
              >
                {state.frame.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              {FRAMES.map((frame) => (
                <DropdownMenuItem
                  key={frame.id}
                  onClick={() => setState((prev) => ({ ...prev, frame }))}
                >
                  {frame.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {state.frame.type === "browser" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Address</Label>
            <input
              type="text"
              value={state.address}
              onChange={(e) =>
                setState((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-[200px] px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        {state.frame.type !== "none" && (
          <div className="flex items-center space-x-3 pb-2">
            <Switch
              id="frame-dark-mode"
              checked={state.frameDarkMode}
              onCheckedChange={(checked) =>
                setState((prev) => ({ ...prev, frameDarkMode: checked }))
              }
            />
            <Label
              htmlFor="frame-dark-mode"
              className="text-sm text-foreground"
            >
              Frame Dark Mode
            </Label>
          </div>
        )}
        <div className="flex items-center space-x-3 pb-2">
          <Switch
            id="stack-enabled"
            checked={state.stack.enabled}
            onCheckedChange={(checked) =>
              setState((prev) => ({
                ...prev,
                stack: { ...prev.stack, enabled: checked },
              }))
            }
          />
          <Label htmlFor="stack-enabled" className="text-sm text-foreground">
            Enable Stack
          </Label>
        </div>
        {state.stack.enabled && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Stack Effect</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-between bg-secondary/50 backdrop-blur-sm border-border/50 hover:bg-accent/80"
                >
                  {state.stack.effect === "default" ? "Default" : "Silhouette"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                <DropdownMenuItem
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      stack: { ...prev.stack, effect: "default" },
                    }))
                  }
                >
                  Default
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      stack: { ...prev.stack, effect: "silhouette" },
                    }))
                  }
                >
                  Silhouette
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {state.stack.enabled && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Slider
              label="Stack Count"
              value={state.stack.count}
              onChange={(v: number) =>
                setState((prev) => ({
                  ...prev,
                  stack: { ...prev.stack, count: v },
                }))
              }
              min={2}
              max={5}
            />
            <Slider
              label="Stack Scale"
              value={state.stack.scale}
              onChange={(v: number) =>
                setState((prev) => ({
                  ...prev,
                  stack: { ...prev.stack, scale: v },
                }))
              }
              min={0.85}
              max={0.99}
              step={0.01}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Slider
              label="Stack Offset X"
              value={state.stack.offsetX}
              onChange={(v: number) =>
                setState((prev) => ({
                  ...prev,
                  stack: { ...prev.stack, offsetX: v },
                }))
              }
              min={-30}
              max={30}
              unit="px"
            />
            <Slider
              label="Stack Offset Y"
              value={state.stack.offsetY}
              onChange={(v: number) =>
                setState((prev) => ({
                  ...prev,
                  stack: { ...prev.stack, offsetY: v },
                }))
              }
              min={-15}
              max={30}
              unit="px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
