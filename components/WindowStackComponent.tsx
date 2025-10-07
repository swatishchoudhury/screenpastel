import type React from "react";
import WindowFrameComponent from "./WindowFrameComponent";

interface WindowStackComponentProps {
  stack: {
    enabled: boolean;
    count: number;
    offsetX: number;
    offsetY: number;
    scale: number;
    opacity: number;
    blur: number;
    effect: "default" | "silhouette";
  };
  frameProps: {
    type: string;
    darkMode: boolean;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    address: string;
  };
  image: string;
  scale: number;
  rotation: number;
  shadowString: string;
}

const WindowStackComponent: React.FC<WindowStackComponentProps> = ({
  stack,
  frameProps,
  image,
  scale,
  rotation,
  shadowString,
}) => {
  if (!stack.enabled) {
    return (
      <div
        style={{
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          boxShadow: shadowString,
          borderRadius: `${frameProps.borderRadius}px`,
        }}
      >
        <WindowFrameComponent {...frameProps}>
          <div className="overflow-hidden">
            <img
              src={image}
              alt="Screenshot"
              className="block max-w-full h-auto object-contain"
              style={{ maxHeight: "45vh" }}
            />
          </div>
        </WindowFrameComponent>
      </div>
    );
  }

  const renderImage = (isStack: boolean) => {
    if (isStack && stack.effect === "silhouette") {
      return (
        <div
          className="bg-black opacity-50"
          style={{ height: "45vh" }}
        />
      );
    }
    return (
      <img
        src={image}
        alt="Screenshot"
        className="block max-w-full h-auto object-contain"
        style={{
          maxHeight: "45vh",
          filter: isStack ? "brightness(0.8)" : undefined,
        }}
      />
    );
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      {Array.from({ length: stack.count - 1 }).map((_, i) => {
        const index = stack.count - 2 - i;
        const offsetX = (index + 1) * stack.offsetX;
        const offsetY = (index + 1) * stack.offsetY;
        const scaleValue = stack.scale ** (index + 1);

        return (
          <div
            key={i}
            className="absolute left-1/2 top-0 pointer-events-none"
            style={{
              transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) scaleX(${scaleValue})`,
              transformOrigin: "top center",
              opacity: stack.opacity,
              filter: stack.blur ? `blur(${stack.blur}px)` : undefined,
              width: "100%",
            }}
          >
            <WindowFrameComponent {...frameProps}>
              <div className="overflow-hidden">{renderImage(true)}</div>
            </WindowFrameComponent>
          </div>
        );
      })}

      <div
        style={{
          boxShadow: shadowString,
          borderRadius: `${frameProps.borderRadius}px`,
        }}
        className="relative z-10"
      >
        <WindowFrameComponent {...frameProps}>
          <div className="overflow-hidden">{renderImage(false)}</div>
        </WindowFrameComponent>
      </div>
    </div>
  );
};

export default WindowStackComponent;
