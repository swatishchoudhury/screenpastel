"use client";

import { Check, ChevronDown, RectangleHorizontal, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropToolProps {
  imageSrc: string;
  onApply: (croppedImage: string) => void;
  onCancel: () => void;
}

type DragHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "move"
  | null;

const CROP_RATIOS = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
];

export default function CropTool({
  imageSrc,
  onApply,
  onCancel,
}: CropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgRect, setImgRect] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<CropRegion>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<CropRegion>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [selectedRatioLabel, setSelectedRatioLabel] = useState("Free");
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imgLoaded && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      setImgRect({ width: w, height: h });
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      const inset = 0.1;
      setCrop({
        x: w * inset,
        y: h * inset,
        width: w * (1 - 2 * inset),
        height: h * (1 - 2 * inset),
      });
    }
  }, [imgLoaded]);

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current && imgLoaded) {
        const rect = imgRef.current.getBoundingClientRect();
        const oldW = imgRect.width || 1;
        const oldH = imgRect.height || 1;
        const scaleX = rect.width / oldW;
        const scaleY = rect.height / oldH;
        setImgRect({ width: rect.width, height: rect.height });
        setCrop((prev) => ({
          x: prev.x * scaleX,
          y: prev.y * scaleY,
          width: prev.width * scaleX,
          height: prev.height * scaleY,
        }));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imgLoaded, imgRect.width, imgRect.height]);

  const clampCrop = useCallback(
    (c: CropRegion): CropRegion => {
      const minSize = 20;
      let { x, y, width, height } = c;
      width = Math.max(minSize, Math.min(width, imgRect.width));
      height = Math.max(minSize, Math.min(height, imgRect.height));
      x = Math.max(0, Math.min(x, imgRect.width - width));
      y = Math.max(0, Math.min(y, imgRect.height - height));
      return { x, y, width, height };
    },
    [imgRect],
  );

  const applyAspectRatio = useCallback(
    (
      c: CropRegion,
      ratio: number | null,
      anchor: "center" | "top-left" = "center",
    ): CropRegion => {
      if (!ratio) return c;
      let { x, y, width, height } = c;
      const newHeight = width / ratio;
      if (newHeight <= imgRect.height) {
        if (anchor === "center") {
          const centerY = y + height / 2;
          height = newHeight;
          y = centerY - height / 2;
        } else {
          height = newHeight;
        }
      } else {
        height = imgRect.height;
        width = height * ratio;
        if (anchor === "center") {
          const centerX = x + c.width / 2;
          x = centerX - width / 2;
        }
      }
      return clampCrop({ x, y, width, height });
    },
    [imgRect, clampCrop],
  );

  useEffect(() => {
    if (aspectRatio !== null && imgRect.width > 0) {
      setCrop((prev) => applyAspectRatio(prev, aspectRatio, "center"));
    }
  }, [aspectRatio, applyAspectRatio, imgRect.width]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, handle: DragHandle) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
      setCropStart({ ...crop });
    },
    [crop],
  );

  useEffect(() => {
    if (!activeHandle) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (activeHandle === "move") {
        const newX = Math.max(
          0,
          Math.min(cropStart.x + dx, imgRect.width - cropStart.width),
        );
        const newY = Math.max(
          0,
          Math.min(cropStart.y + dy, imgRect.height - cropStart.height),
        );
        setCrop({
          x: newX,
          y: newY,
          width: cropStart.width,
          height: cropStart.height,
        });
        return;
      }

      if (!aspectRatio) {
        let { x, y, width, height } = cropStart;

        if (activeHandle.includes("left")) {
          x = cropStart.x + dx;
          width = cropStart.width - dx;
          if (x < 0) {
            width += x;
            x = 0;
          }
          if (width < 20) {
            x = cropStart.x + cropStart.width - 20;
            width = 20;
          }
        }
        if (activeHandle.includes("right")) {
          width = cropStart.width + dx;
          if (x + width > imgRect.width) {
            width = imgRect.width - x;
          }
          if (width < 20) {
            width = 20;
          }
        }
        if (activeHandle.includes("top")) {
          y = cropStart.y + dy;
          height = cropStart.height - dy;
          if (y < 0) {
            height += y;
            y = 0;
          }
          if (height < 20) {
            y = cropStart.y + cropStart.height - 20;
            height = 20;
          }
        }
        if (activeHandle.includes("bottom")) {
          height = cropStart.height + dy;
          if (y + height > imgRect.height) {
            height = imgRect.height - y;
          }
          if (height < 20) {
            height = 20;
          }
        }

        setCrop({ x, y, width, height });
        return;
      }

      let anchorX: number;
      let anchorY: number;

      if (activeHandle.includes("left")) {
        anchorX = cropStart.x + cropStart.width;
      } else if (activeHandle.includes("right")) {
        anchorX = cropStart.x;
      } else {
        anchorX = cropStart.x + cropStart.width / 2;
      }

      if (activeHandle.includes("top")) {
        anchorY = cropStart.y + cropStart.height;
      } else if (activeHandle.includes("bottom")) {
        anchorY = cropStart.y;
      } else {
        anchorY = cropStart.y + cropStart.height / 2;
      }

      let desiredWidth: number;

      const isCorner =
        (activeHandle.includes("top") || activeHandle.includes("bottom")) &&
        (activeHandle.includes("left") || activeHandle.includes("right"));

      if (isCorner) {
        const widthFromDx = activeHandle.includes("left")
          ? cropStart.width - dx
          : cropStart.width + dx;
        const heightFromDy = activeHandle.includes("top")
          ? cropStart.height - dy
          : cropStart.height + dy;
        const widthFromDy = heightFromDy * aspectRatio;
        desiredWidth = Math.abs(dx) >= Math.abs(dy) ? widthFromDx : widthFromDy;
      } else if (activeHandle === "top" || activeHandle === "bottom") {
        const desiredHeight =
          activeHandle === "top"
            ? cropStart.height - dy
            : cropStart.height + dy;
        desiredWidth = desiredHeight * aspectRatio;
      } else {
        desiredWidth =
          activeHandle === "left" ? cropStart.width - dx : cropStart.width + dx;
      }

      let w = Math.max(20, desiredWidth);
      let h = w / aspectRatio;
      if (h < 20) {
        h = 20;
        w = h * aspectRatio;
      }

      if (w > imgRect.width) {
        w = imgRect.width;
        h = w / aspectRatio;
      }
      if (h > imgRect.height) {
        h = imgRect.height;
        w = h * aspectRatio;
      }

      if (activeHandle.includes("left")) {
        if (w > anchorX) {
          w = anchorX;
          h = w / aspectRatio;
        }
      } else if (activeHandle.includes("right")) {
        if (anchorX + w > imgRect.width) {
          w = imgRect.width - anchorX;
          h = w / aspectRatio;
        }
      }

      if (activeHandle.includes("top")) {
        if (h > anchorY) {
          h = anchorY;
          w = h * aspectRatio;
        }
      } else if (activeHandle.includes("bottom")) {
        if (anchorY + h > imgRect.height) {
          h = imgRect.height - anchorY;
          w = h * aspectRatio;
        }
      }

      let newX: number;
      let newY: number;

      if (activeHandle.includes("left")) {
        newX = anchorX - w;
      } else if (activeHandle.includes("right")) {
        newX = anchorX;
      } else {
        newX = anchorX - w / 2;
        if (newX < 0) newX = 0;
        if (newX + w > imgRect.width) newX = imgRect.width - w;
      }

      if (activeHandle.includes("top")) {
        newY = anchorY - h;
      } else if (activeHandle.includes("bottom")) {
        newY = anchorY;
      } else {
        newY = anchorY - h / 2;
        if (newY < 0) newY = 0;
        if (newY + h > imgRect.height) newY = imgRect.height - h;
      }

      setCrop({ x: newX, y: newY, width: w, height: h });
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeHandle, dragStart, cropStart, aspectRatio, imgRect]);

  const handleApply = () => {
    if (!imgRef.current || imgRect.width === 0) return;

    const scaleX = naturalSize.width / imgRect.width;
    const scaleY = naturalSize.height / imgRect.height;

    const canvas = document.createElement("canvas");
    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.width * scaleX;
    const sh = crop.height * scaleY;
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(
        img,
        Math.round(sx),
        Math.round(sy),
        Math.round(sw),
        Math.round(sh),
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const croppedDataUrl = canvas.toDataURL("image/png");
      onApply(croppedDataUrl);
    };
    img.src = imageSrc;
  };

  const cornerHitArea = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: 20,
    height: 20,
    cursor,
    zIndex: 60,
    pointerEvents: "auto",
  });

  const edgeStyle = (
    cursor: string,
    isHorizontal: boolean,
  ): React.CSSProperties => ({
    position: "absolute",
    cursor,
    zIndex: 55,
    pointerEvents: "auto",
    ...(isHorizontal
      ? { height: 10, left: 20, right: 20 }
      : { width: 10, top: 20, bottom: 20 }),
  });

  const thirdW = crop.width / 3;
  const thirdH = crop.height / 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-xl px-3 py-2 shadow-2xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              {selectedRatioLabel}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[140px] z-[200]">
            {CROP_RATIOS.map((r) => (
              <DropdownMenuItem
                key={r.label}
                onClick={() => {
                  setAspectRatio(r.value);
                  setSelectedRatioLabel(r.label);
                }}
                className={selectedRatioLabel === r.label ? "bg-accent" : ""}
              >
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>

        <Button
          size="sm"
          onClick={handleApply}
          className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Check className="w-3.5 h-3.5" />
          Apply Crop
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative inline-block select-none"
        style={{ touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Crop preview"
          className="block max-w-[85vw] max-h-[80vh] object-contain"
          onLoad={() => setImgLoaded(true)}
          draggable={false}
        />

        {imgLoaded && (
          <>
            <div
              className="absolute left-0 right-0 top-0 bg-black/60 pointer-events-none"
              style={{ height: crop.y }}
            />
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none"
              style={{ height: imgRect.height - (crop.y + crop.height) }}
            />
            <div
              className="absolute left-0 bg-black/60 pointer-events-none"
              style={{ top: crop.y, height: crop.height, width: crop.x }}
            />
            <div
              className="absolute right-0 bg-black/60 pointer-events-none"
              style={{
                top: crop.y,
                height: crop.height,
                width: imgRect.width - (crop.x + crop.width),
              }}
            />

            <div
              style={{
                position: "absolute",
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
                cursor: activeHandle === "move" ? "grabbing" : "grab",
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              <div className="absolute inset-0 border-2 border-white/90 pointer-events-none rounded-[1px]" />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: activeHandle ? 0.5 : 0.25 }}
              >
                <line
                  x1={thirdW}
                  y1={0}
                  x2={thirdW}
                  y2={crop.height}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1={thirdW * 2}
                  y1={0}
                  x2={thirdW * 2}
                  y2={crop.height}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1={0}
                  y1={thirdH}
                  x2={crop.width}
                  y2={thirdH}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1={0}
                  y1={thirdH * 2}
                  x2={crop.width}
                  y2={thirdH * 2}
                  stroke="white"
                  strokeWidth="0.5"
                />
              </svg>

              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <path
                  d="M 0 12 L 0 0 L 12 0"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />
                <path
                  d={`M ${crop.width - 12} 0 L ${crop.width} 0 L ${crop.width} 12`}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />
                <path
                  d={`M 0 ${crop.height - 12} L 0 ${crop.height} L 12 ${crop.height}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />
                <path
                  d={`M ${crop.width - 12} ${crop.height} L ${crop.width} ${crop.height} L ${crop.width} ${crop.height - 12}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />
              </svg>

              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                {Math.round(crop.width * (naturalSize.width / imgRect.width))} ×{" "}
                {Math.round(
                  crop.height * (naturalSize.height / imgRect.height),
                )}
              </div>
            </div>

            <div
              style={{
                ...cornerHitArea("nwse-resize"),
                left: crop.x - 10,
                top: crop.y - 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, "top-left")}
            />
            <div
              style={{
                ...cornerHitArea("nesw-resize"),
                left: crop.x + crop.width - 10,
                top: crop.y - 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, "top-right")}
            />
            <div
              style={{
                ...cornerHitArea("nesw-resize"),
                left: crop.x - 10,
                top: crop.y + crop.height - 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, "bottom-left")}
            />
            <div
              style={{
                ...cornerHitArea("nwse-resize"),
                left: crop.x + crop.width - 10,
                top: crop.y + crop.height - 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, "bottom-right")}
            />

            <div
              style={{
                ...edgeStyle("ns-resize", true),
                top: crop.y - 4,
                left: crop.x,
              }}
              onPointerDown={(e) => handlePointerDown(e, "top")}
            />
            <div
              style={{
                ...edgeStyle("ns-resize", true),
                top: crop.y + crop.height - 4,
                left: crop.x,
              }}
              onPointerDown={(e) => handlePointerDown(e, "bottom")}
            />
            <div
              style={{
                ...edgeStyle("ew-resize", false),
                left: crop.x - 4,
                top: crop.y,
              }}
              onPointerDown={(e) => handlePointerDown(e, "left")}
            />
            <div
              style={{
                ...edgeStyle("ew-resize", false),
                left: crop.x + crop.width - 4,
                top: crop.y,
              }}
              onPointerDown={(e) => handlePointerDown(e, "right")}
            />
          </>
        )}
      </div>
    </div>
  );
}
