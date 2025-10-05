interface WindowFrame {
  id: string;
  name: string;
  type: "macos" | "windows" | "browser" | "none" | "macos-unified";
}

interface Background {
  id: string;
  name: string;
  type: "gradient" | "solid";
  value: string;
}

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  enabled: boolean;
}

interface StackConfig {
  enabled: boolean;
  count: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
  blur: number;
}

interface EditorState {
  image: string | null;
  frame: WindowFrame;
  background: Background;
  shadows: ShadowLayer[];
  borderRadius: number;
  padding: number;
  scale: number;
  rotation: number;
  border: {
    width: number;
    color: string;
  };
  stack: StackConfig;
  frameDarkMode: boolean;
  customGradient: {
    color1: string;
    color2: string;
  };
  gradientDirection: number;
  address: string;
}

export type { WindowFrame, Background, ShadowLayer, StackConfig, EditorState };
