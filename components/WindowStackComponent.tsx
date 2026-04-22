import { Move3d, RotateCw } from "lucide-react";
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
  positionX: number;
  positionY: number;
  onScaleStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onRotateStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
  on3DRotateStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
  showHandles?: boolean;
  flipX: boolean;
  flipY: boolean;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
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
  on3DRotateStart,
  showHandles,
  flipX,
  flipY,
  rotateX,
  rotateY,
  rotateZ,
}) => {
  const renderResizeHandles = () => {
    if (!onScaleStart) return null;
    const hitArea =
      "absolute flex items-center justify-center pointer-events-auto z-50 w-10 h-10 -translate-x-1/2 -translate-y-1/2 touch-none";
    const dot = `w-3.5 h-3.5 md:w-3 md:h-3 border border-primary/60 bg-background/90 rounded-full transition-[opacity,transform] hover:scale-110 shadow-sm md:hover:border-primary ${showHandles ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`;

    return (
      <>
        <div
          className={`${hitArea} cursor-nwse-resize`}
          style={{ top: 0, left: 0 }}
          onPointerDown={onScaleStart}
        >
          <div className={dot} />
        </div>
        <div
          className={`${hitArea} cursor-nesw-resize`}
          style={{ top: 0, left: "100%" }}
          onPointerDown={onScaleStart}
        >
          <div className={dot} />
        </div>
        <div
          className={`${hitArea} cursor-nesw-resize`}
          style={{ top: "100%", left: 0 }}
          onPointerDown={onScaleStart}
        >
          <div className={dot} />
        </div>
        <div
          className={`${hitArea} cursor-nwse-resize`}
          style={{ top: "100%", left: "100%" }}
          onPointerDown={onScaleStart}
        >
          <div className={dot} />
        </div>
        {onRotateStart && (
          <div
            className={`absolute left-1/2 flex flex-col items-center transition-opacity z-50 pointer-events-auto touch-none ${showHandles ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            style={{ top: "-40px", transform: "translateX(-50%)" }}
          >
            <div
              className="flex items-center justify-center p-2 cursor-grab text-primary/80 hover:text-primary transition-colors"
              onPointerDown={onRotateStart}
              title="Drag to rotate"
            >
              <div className="flex items-center justify-center w-6 h-6 border border-primary/60 bg-background/90 rounded-full shadow-sm md:hover:border-primary pointer-events-none transition-transform hover:scale-110">
                <RotateCw className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="w-px h-2.5 bg-primary/40 -mt-1" />
          </div>
        )}
        {on3DRotateStart && (
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity z-50 pointer-events-auto touch-none ${
              showHandles ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onPointerDown={on3DRotateStart}
          >
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-background/20 backdrop-blur-md border border-white/30 shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform group/3d overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-white/40 bg-white/10 shadow-inner">
                <Move3d
                  className="w-5 h-5 text-white drop-shadow-sm"
                  strokeWidth={1.5}
                />
              </div>
              <div className="absolute inset-0 border-[6px] border-white/5 rounded-full pointer-events-none" />
            </div>
          </div>
        )}
      </>
    );
  };
  const has3D = rotateX !== 0 || rotateY !== 0 || rotateZ !== 0;

  if (!stack.enabled) {
    return (
      <div
        data-transform-container
        className="relative inline-flex items-center justify-center cursor-move group"
        style={{
          transform: `translateX(${positionX}px) translateY(${positionY}px) scale(${scale}) rotate(${rotation}deg)${has3D ? ` rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)` : ""}`,
          transformStyle: has3D ? "preserve-3d" : undefined,
        }}
      >
        {renderResizeHandles()}
        <div
          style={{
            boxShadow: shadowString,
            borderRadius: `${frameProps.borderRadius + frameProps.borderWidth}px`,
            transformStyle: has3D ? "preserve-3d" : undefined,
          }}
          className="relative z-10"
        >
          <WindowFrameComponent {...frameProps}>
            <div className="overflow-hidden">
              <img
                src={image}
                alt="Screenshot"
                className="block max-w-full h-auto object-contain"
                style={{
                  maxHeight: "45vh",
                  transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                }}
              />
            </div>
          </WindowFrameComponent>
        </div>
      </div>
    );
  }

  const renderImage = (isStack: boolean) => {
    if (isStack && stack.effect === "silhouette") {
      return <div className="bg-black opacity-50" style={{ height: "45vh" }} />;
    }
    return (
      <img
        src={image}
        alt="Screenshot"
        className="block max-w-full h-auto object-contain"
        style={{
          maxHeight: "45vh",
          filter: isStack ? "brightness(0.8)" : undefined,
          transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
        }}
      />
    );
  };

  return (
    <div
      data-transform-container
      className="relative inline-flex items-center justify-center cursor-move group"
      style={{
        transform: `translateX(${positionX}px) translateY(${positionY}px) scale(${scale}) rotate(${rotation}deg)${has3D ? ` rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)` : ""}`,
        transformStyle: has3D ? "preserve-3d" : undefined,
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
              transformStyle: has3D ? "preserve-3d" : undefined,
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
          transformStyle: has3D ? "preserve-3d" : undefined,
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
