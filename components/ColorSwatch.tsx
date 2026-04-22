"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";

interface ColorSwatchProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const _isValidHex = (hex: string): boolean =>
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

const normalizeHex = (input: string): string | null => {
  let hex = input.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  hex = hex.toLowerCase();

  if (/^#[0-9a-f]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
};

export default function ColorSwatch({
  value,
  onChange,
  label,
}: ColorSwatchProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState(
    value.toUpperCase().replace("#", ""),
  );
  const [isFocused, setIsFocused] = useState(false);

  const displayHex = isFocused
    ? hexInput
    : value.toUpperCase().replace("#", "");

  const commitHex = () => {
    const normalized = normalizeHex(hexInput);
    if (normalized) {
      onChange(normalized);
    }
    setHexInput(value.toUpperCase().replace("#", ""));
    setIsFocused(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center text-xs">
          <Label className="text-muted-foreground">{label}</Label>
        </div>
      )}
      <div className="flex items-center gap-0 bg-secondary/40 border border-border/50 rounded-md p-1 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all hover:bg-secondary/60 w-[108px]">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className="relative flex-shrink-0 mr-1.5"
        >
          <div
            className="w-[22px] h-[22px] rounded-[4px] border border-black/10 dark:border-white/10 shadow-sm cursor-pointer"
            style={{ backgroundColor: value }}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setHexInput(e.target.value.toUpperCase().replace("#", ""));
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
        </button>

        <div className="flex items-center gap-0 flex-1 w-full">
          <span className="text-[11px] text-muted-foreground select-none font-mono">
            #
          </span>
          <input
            type="text"
            value={displayHex}
            onChange={(e) => {
              const raw = e.target.value
                .replace(/[^0-9A-Fa-f]/g, "")
                .slice(0, 6);
              setHexInput(raw);
              const normalized = normalizeHex(raw);
              if (normalized) {
                onChange(normalized);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              setHexInput(value.toUpperCase().replace("#", ""));
            }}
            onBlur={commitHex}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setHexInput(value.toUpperCase().replace("#", ""));
                setIsFocused(false);
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-transparent text-[11px] font-mono uppercase outline-none text-foreground placeholder:text-muted-foreground p-0 m-0 leading-none pl-[0.5px]"
            placeholder="000000"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
