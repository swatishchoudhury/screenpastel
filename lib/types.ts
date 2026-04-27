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

interface GradientStop {
  id: string;
  position: number;
  color: string;
  opacity: number;
}

interface GradientConfig {
  direction: number;
  stops: GradientStop[];
}

interface Theme {
  id: string;
  name: string;
  direction: number;
  stops: GradientStop[];
}

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
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
  gradient: GradientConfig;
  address: string;
  backgroundTintColor: string;
  backgroundTintOpacity: number;
  backgroundBlur: number;
  positionX: number;
  positionY: number;
  aspectRatio: string;
  flipX: boolean;
  flipY: boolean;
  perspective: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export type {
  WindowFrame,
  Background,
  GradientStop,
  GradientConfig,
  Theme,
  ShadowLayer,
  StackConfig,
  EditorState,
};
