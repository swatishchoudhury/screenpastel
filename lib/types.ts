interface WindowFrame {
  id: string;
  name: string;
  type: "macos" | "windows" | "browser" | "none" | "macos-unified";
}

interface Background {
  id: string;
  name: string;
  type: "gradient" | "solid" | "image";
  value: string;
}

interface Theme {
  id: string;
  name: string;
  color1: string;
  color2: string;
  direction: number;
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
  effect: "default" | "silhouette";
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
  backgroundTintColor: string;
  backgroundTintOpacity: number;
}

export type { WindowFrame, Background, Theme, ShadowLayer, StackConfig, EditorState };
