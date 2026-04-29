"use client";

import { Minus, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { GradientConfig, GradientStop } from "@/lib/types";
import Slider from "./Slider";

interface GradientEditorProps {
  config: GradientConfig;
  onChange: (config: GradientConfig) => void;
  onCommit: (config: GradientConfig) => void;
}

function lerpColor(c1: string, c2: string, t: number): string {
  const h1 = c1.replace("#", "");
  const h2 = c2.replace("#", "");
  const r = Math.round(
    parseInt(h1.substring(0, 2), 16) * (1 - t) +
      parseInt(h2.substring(0, 2), 16) * t,
  );
  const g = Math.round(
    parseInt(h1.substring(2, 4), 16) * (1 - t) +
      parseInt(h2.substring(2, 4), 16) * t,
  );
  const b = Math.round(
    parseInt(h1.substring(4, 6), 16) * (1 - t) +
      parseInt(h2.substring(4, 6), 16) * t,
  );
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (opacity >= 100) return hex;
  return `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`;
}

export default function GradientEditor({
  config,
  onChange,
  onCommit,
}: GradientEditorProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    config.stops[0]?.id ?? null,
  );
  const [draggingStopId, setDraggingStopId] = useState<string | null>(null);
  const commitRef = useRef<GradientConfig | null>(null);

  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);

  const barGradient = (() => {
    const sorted = [...config.stops].sort((a, b) => a.position - b.position);
    const stops = sorted
      .map((s) => `${hexToRgba(s.color, s.opacity)} ${s.position}%`)
      .join(", ");
    return `linear-gradient(90deg, ${stops})`;
  })();

  const getPositionFromEvent = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    return pct;
  }, []);

  const handleStopPointerDown = useCallback(
    (e: React.PointerEvent, stopId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedStopId(stopId);
      setDraggingStopId(stopId);
      commitRef.current = config;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [config],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingStopId) return;
      const pos = getPositionFromEvent(e.clientX);
      const newStops = config.stops.map((s) =>
        s.id === draggingStopId ? { ...s, position: pos } : s,
      );
      const newConfig = { ...config, stops: newStops };
      onChange(newConfig);
    },
    [draggingStopId, config, onChange, getPositionFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    if (draggingStopId && commitRef.current) {
      onCommit(config);
      commitRef.current = null;
    }
    setDraggingStopId(null);
  }, [draggingStopId, config, onCommit]);

  const addStop = useCallback(() => {
    const sorted = [...config.stops].sort((a, b) => a.position - b.position);
    let bestGap = 0;
    let gapIndex = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > bestGap) {
        bestGap = gap;
        gapIndex = i;
      }
    }
    const left = sorted[gapIndex];
    const right = sorted[gapIndex + 1];
    const midPosition = Math.round((left.position + right.position) / 2);
    const midColor = lerpColor(left.color, right.color, 0.5);
    const midOpacity = Math.round((left.opacity + right.opacity) / 2);

    const newStop: GradientStop = {
      id: nanoid(),
      position: midPosition,
      color: midColor,
      opacity: midOpacity,
    };
    const newConfig = { ...config, stops: [...config.stops, newStop] };
    setSelectedStopId(newStop.id);
    onChange(newConfig);
    onCommit(newConfig);
  }, [config, onChange, onCommit]);

  const deleteStop = useCallback(
    (stopId: string) => {
      if (config.stops.length <= 2) return;
      const newStops = config.stops.filter((s) => s.id !== stopId);
      const newConfig = { ...config, stops: newStops };
      if (selectedStopId === stopId) {
        setSelectedStopId(newStops[0]?.id ?? null);
      }
      onChange(newConfig);
      onCommit(newConfig);
    },
    [config, selectedStopId, onChange, onCommit],
  );

  const updateStop = useCallback(
    (stopId: string, updates: Partial<GradientStop>) => {
      const newStops = config.stops.map((s) =>
        s.id === stopId ? { ...s, ...updates } : s,
      );
      const newConfig = { ...config, stops: newStops };
      onChange(newConfig);
      onCommit(newConfig);
    },
    [config, onChange, onCommit],
  );

  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if (draggingStopId) return;
      const pos = getPositionFromEvent(e.clientX);
      const sorted = [...config.stops].sort((a, b) => a.position - b.position);
      let left = sorted[0];
      let right = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
          left = sorted[i];
          right = sorted[i + 1];
          break;
        }
      }
      const range = right.position - left.position;
      const t = range > 0 ? (pos - left.position) / range : 0.5;
      const color = lerpColor(left.color, right.color, t);
      const opacity = Math.round(left.opacity * (1 - t) + right.opacity * t);

      const newStop: GradientStop = {
        id: nanoid(),
        position: pos,
        color,
        opacity,
      };
      const newConfig = { ...config, stops: [...config.stops, newStop] };
      setSelectedStopId(newStop.id);
      onChange(newConfig);
      onCommit(newConfig);
    },
    [config, draggingStopId, getPositionFromEvent, onChange, onCommit],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div
          ref={barRef}
          className="relative w-full h-8 rounded-md cursor-crosshair shadow-inner border border-border/50"
          style={{ background: barGradient }}
          onClick={handleBarClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="absolute inset-0 rounded-md -z-10"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)",
              backgroundSize: "8px 8px",
            }}
          />

          {sortedStops.map((stop) => (
            <div
              key={stop.id}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-sm border-2 cursor-grab active:cursor-grabbing transition-shadow ${
                selectedStopId === stop.id
                  ? "border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.6)] z-20 scale-110"
                  : "border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.3)] z-10"
              }`}
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.color,
              }}
              onPointerDown={(e) => handleStopPointerDown(e, stop.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStopId(stop.id);
              }}
            />
          ))}
        </div>
      </div>

      <Slider
        label="Direction"
        value={config.direction}
        min={0}
        max={360}
        onChange={(v) => onChange({ ...config, direction: v })}
        onCommit={(v) => onCommit({ ...config, direction: v })}
        unit="°"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Stops</Label>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={addStop}
            title="Add stop"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="space-y-1.5">
          {sortedStops.map((stop) => (
            <div
              key={stop.id}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors cursor-pointer ${
                selectedStopId === stop.id
                  ? "bg-accent/60 ring-1 ring-primary/20"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => setSelectedStopId(stop.id)}
            >
              <div className="flex items-center gap-0 bg-secondary/50 border border-border/50 rounded overflow-hidden w-[42px] flex-shrink-0">
                <input
                  type="text"
                  value={stop.position}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      updateStop(stop.id, { position: val });
                    }
                  }}
                  className="w-6 bg-transparent text-[11px] font-mono text-right py-0.5 outline-none text-foreground"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-[10px] text-muted-foreground pr-1 select-none font-mono">
                  %
                </span>
              </div>

              <div className="flex items-center gap-0 bg-secondary/50 border border-border/50 rounded overflow-hidden flex-1 min-w-0 h-7">
                <div className="relative flex-shrink-0 ml-1">
                  <div
                    className="w-[18px] h-[18px] rounded-[3px] border border-black/10 cursor-pointer"
                    style={{ backgroundColor: stop.color }}
                  />
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) =>
                      updateStop(stop.id, { color: e.target.value })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    tabIndex={-1}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex items-center flex-1 min-w-0 ml-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    #
                  </span>
                  <input
                    type="text"
                    value={stop.color.toUpperCase().replace("#", "")}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/[^0-9A-Fa-f]/g, "")
                        .slice(0, 6);
                      if (raw.length === 6) {
                        updateStop(stop.id, { color: `#${raw.toLowerCase()}` });
                      }
                    }}
                    className="w-full bg-transparent text-[11px] font-mono uppercase outline-none text-foreground px-0.5"
                    spellCheck={false}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="w-px h-3 bg-border/50 mx-1" />

                <div className="flex items-center flex-shrink-0">
                  <input
                    type="text"
                    value={stop.opacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        updateStop(stop.id, { opacity: val });
                      }
                    }}
                    className="w-6 bg-transparent text-[11px] font-mono text-right py-0.5 outline-none text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-[10px] text-muted-foreground pr-1 select-none font-mono">
                    %
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 flex-shrink-0 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteStop(stop.id);
                }}
                disabled={config.stops.length <= 2}
                title="Remove stop"
              >
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
