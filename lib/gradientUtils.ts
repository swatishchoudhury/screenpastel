import { nanoid } from "nanoid";
import type { GradientConfig, GradientStop } from "./types";

// Convert hex + opacity (0-100) to an rgba string
function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (opacity >= 100) return hex;
  return `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`;
}

// Parse a CSS linear-gradient string into a GradientConfig
// Supports N color stops
// Input:  "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
// Output: { direction: 135, stops: [...] }
export function parseGradient(value: string): GradientConfig {
  const defaults: GradientConfig = {
    direction: 135,
    stops: [
      { id: nanoid(), position: 0, color: "#ffffff", opacity: 100 },
      { id: nanoid(), position: 100, color: "#000000", opacity: 100 },
    ],
  };

  try {
    const inner = value.replace(/^linear-gradient\(/, "").replace(/\)$/, "");
    // Split only on commas that are NOT inside parentheses (for rgba values)
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const char of inner) {
      if (char === "(") depth++;
      if (char === ")") depth--;
      if (char === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());

    // First part is the angle
    const direction = parseInt(parts[0].replace("deg", ""), 10);
    if (isNaN(direction)) return defaults;

    // Remaining parts are color stops
    const stops: GradientStop[] = [];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      // Match: color then position%
      // Color can be hex (#xxx or #xxxxxx) or rgba(...)
      const percentMatch = part.match(/(\d+)%\s*$/);
      const position = percentMatch
        ? parseInt(percentMatch[1], 10)
        : i === 1
          ? 0
          : 100;
      const colorStr = part.replace(/\d+%\s*$/, "").trim();

      // Parse rgba if present
      const rgbaMatch = colorStr.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      );
      let color: string;
      let opacity: number;
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1], 10);
        const g = parseInt(rgbaMatch[2], 10);
        const b = parseInt(rgbaMatch[3], 10);
        opacity = rgbaMatch[4]
          ? Math.round(parseFloat(rgbaMatch[4]) * 100)
          : 100;
        color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      } else {
        color = colorStr;
        opacity = 100;
      }

      stops.push({ id: nanoid(), position, color, opacity });
    }

    if (stops.length < 2) return defaults;
    return { direction, stops };
  } catch {
    return defaults;
  }
}

// Build a CSS linear-gradient string from a GradientConfig
export function buildGradient(config: GradientConfig): string {
  const { direction, stops } = config;
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorStops = sorted
    .map((s) => `${hexToRgba(s.color, s.opacity)} ${s.position}%`)
    .join(", ");
  return `linear-gradient(${direction}deg, ${colorStops})`;
}

