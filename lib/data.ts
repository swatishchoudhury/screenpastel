import backgroundsData from "./backgrounds.json";
import type { Background, WindowFrame } from "./types";

const FRAMES: WindowFrame[] = [
  { id: "none", name: "None", type: "none" },
  { id: "macos", name: "macOS", type: "macos" },
  { id: "macos-unified", name: "macOS Unified", type: "macos-unified" },
  { id: "windows", name: "Windows 11", type: "windows" },
  { id: "browser", name: "Browser", type: "browser" },
];

const BACKGROUNDS: Background[] = backgroundsData as Background[];

export { FRAMES, BACKGROUNDS };
