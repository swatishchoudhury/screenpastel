"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider as UI_Slider } from "@/components/ui/slider";

function applySnap(value: number, snapPoints?: number[], snapThreshold = 2): number {
  if (!snapPoints || snapPoints.length === 0) return value;
  for (const snap of snapPoints) {
    if (Math.abs(value - snap) <= snapThreshold) return snap;
  }
  return value;
}

const Slider = ({
  label,
  value,
  onChange,
  onCommit,
  min,
  max,
  step = 1,
  unit = "",
  snapPoints,
  snapThreshold = 2,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  snapPoints?: number[];
  snapThreshold?: number;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  const displayValue = isFocused ? inputValue : String(value);

  const snappedOnChange = (v: number) => {
    onChange(applySnap(v, snapPoints, snapThreshold));
  };

  const commitValue = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const precision = step < 1 ? String(step).split(".")[1]?.length || 0 : 0;
      const final = Number(clamped.toFixed(precision));
      onChange(final);
      onCommit?.(final);
    }
    setInputValue(String(value));
    setIsFocused(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <Label className="text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-0 bg-secondary/50 border border-border/50 rounded-md overflow-hidden focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={displayValue}
            onChange={(e) => {
              const raw = e.target.value;
              if (/^-?\d*\.?\d*$/.test(raw) || raw === "" || raw === "-") {
                setInputValue(raw);
                const parsed = parseFloat(raw);
                if (!isNaN(parsed) && parsed >= min && parsed <= max) {
                  const precision = step < 1 ? String(step).split(".")[1]?.length || 0 : 0;
                  onChange(Number(parsed.toFixed(precision)));
                }
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              setInputValue(String(value));
            }}
            onBlur={commitValue}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setInputValue(String(value));
                setIsFocused(false);
                e.currentTarget.blur();
              }
            }}
            className="w-12 bg-transparent text-xs font-mono text-right px-1 py-1 outline-none text-foreground"
            spellCheck={false}
            autoComplete="off"
          />
          {unit && (
            <span className="text-xs text-muted-foreground pr-1.5 select-none font-mono">{unit}</span>
          )}
        </div>
      </div>
      <UI_Slider
        value={[value]}
        onValueChange={(v) => snappedOnChange(v[0])}
        onValueCommit={(v) => onCommit?.(applySnap(v[0], snapPoints, snapThreshold))}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

export default Slider;
