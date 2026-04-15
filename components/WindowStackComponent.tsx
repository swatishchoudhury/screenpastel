import type React from "react";
import { RotateCw } from "lucide-react";
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
  positionX: number;
  positionY: number;
  onScaleStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onRotateStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const WindowStackComponent: React.FC<WindowStackComponentProps> = ({
  stack,
  frameProps,
  image,
  scale,
  rotation,
  shadowString,
  positionX,
  positionY,
  onScaleStart,
  onRotateStart,
}) => {
  const renderResizeHandles = () => {
    if (!onScaleStart) return null;
    const h = "absolute w-3 h-3 border border-primary/60 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto shadow-sm hover:border-primary";
    return (
      <>
        <div className={`${h} cursor-nwse-resize`} style={{ top: '-6px', left: '-6px' }} onPointerDown={onScaleStart} />
        <div className={`${h} cursor-nesw-resize`} style={{ top: '-6px', right: '-6px' }} onPointerDown={onScaleStart} />
        <div className={`${h} cursor-nesw-resize`} style={{ bottom: '-6px', left: '-6px' }} onPointerDown={onScaleStart} />
        <div className={`${h} cursor-nwse-resize`} style={{ bottom: '-6px', right: '-6px' }} onPointerDown={onScaleStart} />
        {onRotateStart && (
          <div
            className="absolute left-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
            style={{ top: '-34px', transform: 'translateX(-50%)' }}
          >
            <div
              className="flex items-center justify-center w-5 h-5 border border-primary/60 bg-background/90 rounded-full cursor-grab shadow-sm hover:border-primary text-primary/80 hover:text-primary transition-colors"
              onPointerDown={onRotateStart}
              title="Drag to rotate"
            >
              <RotateCw className="w-3 h-3" strokeWidth={2.5} />
            </div>
            <div className="w-px h-3 bg-primary/30" />
          </div>
        )}
      </>
    );
  };
  if (!stack.enabled) {
    return (
      <div
        data-transform-container
        className="relative inline-flex items-center justify-center cursor-move group"
        style={{
          transform: `translateX(${positionX}px) translateY(${positionY}px) scale(${scale}) rotate(${rotation}deg)`,
        }}
      >
        {renderResizeHandles()}
        <div
          style={{
            boxShadow: shadowString,
            borderRadius: `${frameProps.borderRadius + frameProps.borderWidth}px`,
          }}
          className="relative z-10"
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
      data-transform-container
      className="relative inline-flex items-center justify-center cursor-move group"
      style={{
        transform: `translateX(${positionX}px) translateY(${positionY}px) scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      {renderResizeHandles()}
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
          borderRadius: `${frameProps.borderRadius + frameProps.borderWidth}px`,
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
