"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Frame,
  Layers,
  Loader2,
  Maximize,
  Minus,
  Palette,
  PanelTop,
  Plus,
  Redo2,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import About from "../components/About";
import BackgroundControls from "../components/BackgroundControls";
import BorderControls from "../components/BorderControls";
import CropTool from "../components/CropTool";
import { FloatingToolbar } from "../components/FloatingToolbar";
import ShadowControls from "../components/ShadowControls";
import TransformControls from "../components/TransformControls";
import WindowControls from "../components/WindowControls";
import WindowStackComponent from "../components/WindowStackComponent";
import { BACKGROUNDS, FRAMES } from "../lib/data";
import {
  copyImage as copyImageUtil,
  exportImage as exportImageUtil,
} from "../lib/imageExporter";
import type { EditorState } from "../lib/types";
import { useHistory } from "../lib/useHistory";

type TabType = "background" | "styling" | "shadow" | "border" | "window";

const INITIAL_STATE: EditorState = {
  image: null,
  frame: FRAMES[0],
  background: BACKGROUNDS[0],
  shadows: [
    {
      id: "1",
      offsetX: 0,
      offsetY: 20,
      blur: 40,
      spread: 0,
      color: "#000000",
      opacity: 0.3,
      enabled: true,
    },
  ],
  borderRadius: 12,
  padding: 60,
  scale: 1,
  rotation: 0,
  border: { width: 0, color: "#ffffff" },
  stack: {
    enabled: false,
    count: 3,
    offsetX: 0,
    offsetY: -10,
    scale: 0.95,
    opacity: 0.5,
    blur: 0,
    effect: "default",
  },
  frameDarkMode: true,
  gradient: {
    direction: 135,
    stops: [
      { id: "1", position: 0, color: "#a8edea", opacity: 100 },
      { id: "2", position: 100, color: "#fed6e3", opacity: 100 },
    ],
  },
  address: "https://screenpastel.vercel.app",
  backgroundTintColor: "#000000",
  backgroundTintOpacity: 0,
  backgroundBlur: 0,
  positionX: 0,
  positionY: 0,
  aspectRatio: "auto",
  flipX: false,
  flipY: false,
  perspective: 1000,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
};

const mergeStateWithNewImage = (
  currentState: EditorState,
  newImage: string | null,
): EditorState => {
  return {
    ...currentState,
    image: newImage,
    scale: INITIAL_STATE.scale,
    rotation: INITIAL_STATE.rotation,
    positionX: INITIAL_STATE.positionX,
    positionY: INITIAL_STATE.positionY,
    aspectRatio: INITIAL_STATE.aspectRatio,
    flipX: INITIAL_STATE.flipX,
    flipY: INITIAL_STATE.flipY,
    perspective: INITIAL_STATE.perspective,
    rotateX: INITIAL_STATE.rotateX,
    rotateY: INITIAL_STATE.rotateY,
    rotateZ: INITIAL_STATE.rotateZ,
  };
};

export default function ScreenshotEditor() {
  const [activeTab, setActiveTab] = useState<TabType | null>("background");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (window.innerWidth < 768) {
      setActiveTab(null);
    }
  }, []);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [isCopying, setIsCopying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);

  const [canvasZoom, _setCanvasZoom] = useState(1);
  const canvasZoomRef = useRef(1);
  const setCanvasZoom = (val: number | ((prev: number) => number)) => {
    _setCanvasZoom((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      canvasZoomRef.current = next;
      return next;
    });
  };

  const {
    state,
    setState,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useHistory(INITIAL_STATE);

  useEffect(() => {
    if (!state.aspectRatio || state.aspectRatio === "auto") {
      setCanvasZoom(1);
      return;
    }

    const match = state.aspectRatio.match(/(\d+):(\d+)/);
    if (!match) return;

    const [_, wStr, hStr] = match;
    const wRatio = parseFloat(wStr);
    const hRatio = parseFloat(hStr);

    const baseWidth = 800;
    const baseHeight = baseWidth * (hRatio / wRatio);

    const isMobile = window.innerWidth < 768;
    const availableWidth = isMobile
      ? window.innerWidth - 32
      : window.innerWidth - 372;
    const availableHeight = window.innerHeight - 120;

    const zoomX = availableWidth / baseWidth;
    const zoomY = availableHeight / baseHeight;

    const targetZoom = Math.min(zoomX, zoomY, 1) * (isMobile ? 0.9 : 0.95);

    setCanvasZoom(Math.round(targetZoom * 100) / 100);
  }, [state.aspectRatio]);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragInitialState = useRef<EditorState | null>(null);
  const isScaling = useRef(false);
  const scaleStart = useRef({
    centerX: 0,
    centerY: 0,
    initialDistance: 0,
    initialScale: 1,
  });
  const scaleInitialState = useRef<EditorState | null>(null);
  const isRotating = useRef(false);
  const rotateStart = useRef({
    centerX: 0,
    centerY: 0,
    initialAngle: 0,
    initialRotation: 0,
  });
  const rotateInitialState = useRef<EditorState | null>(null);
  const is3DRotating = useRef(false);
  const rotate3DStart = useRef({
    x: 0,
    y: 0,
    initialRotateX: 0,
    initialRotateY: 0,
  });
  const rotate3DInitialState = useRef<EditorState | null>(null);
  const [showGuides, setShowGuides] = useState({ x: false, y: false });

  const DRAG_SNAP_THRESHOLD = 6;
  const ROTATION_SNAP_POINTS = [
    0, 45, 90, 135, 180, 270, 360, -45, -90, -135, -180, -270, -360,
  ];
  const ROTATION_SNAP_THRESHOLD = 3;
  const [snappedAngle, setSnappedAngle] = useState<number | null>(null);
  const [showHandles, setShowHandles] = useState(false);
  const handleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        let newX = (e.clientX - dragStart.current.x) / canvasZoomRef.current;
        let newY = (e.clientY - dragStart.current.y) / canvasZoomRef.current;
        const snappedX = Math.abs(newX) <= DRAG_SNAP_THRESHOLD;
        const snappedY = Math.abs(newY) <= DRAG_SNAP_THRESHOLD;
        if (snappedX) newX = 0;
        if (snappedY) newY = 0;
        setShowGuides({ x: snappedX, y: snappedY });
        setState((prev) => ({
          ...prev,
          positionX: newX,
          positionY: newY,
        }));
      } else if (isScaling.current) {
        const { centerX, centerY, initialDistance, initialScale } =
          scaleStart.current;
        if (initialDistance === 0) return;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const newScale = Math.max(
          0.1,
          Math.min(3, initialScale * (currentDistance / initialDistance)),
        );
        setState((prev) => ({
          ...prev,
          scale: Number(newScale.toFixed(2)),
        }));
      } else if (isRotating.current) {
        const { centerX, centerY, initialAngle, initialRotation } =
          rotateStart.current;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let newRotation = initialRotation + (currentAngle - initialAngle);
        let didSnap: number | null = null;
        for (const snap of ROTATION_SNAP_POINTS) {
          if (Math.abs(newRotation - snap) <= ROTATION_SNAP_THRESHOLD) {
            newRotation = snap;
            didSnap = snap;
            break;
          }
        }
        setSnappedAngle(didSnap);
        setState((prev) => ({
          ...prev,
          rotation: Number(newRotation.toFixed(1)),
        }));
      } else if (is3DRotating.current) {
        const dx = (e.clientX - rotate3DStart.current.x) / 2;
        const dy = (e.clientY - rotate3DStart.current.y) / 2;
        const newX = Math.round(
          Math.max(
            -90,
            Math.min(90, rotate3DStart.current.initialRotateX - dy),
          ),
        );
        const newY = Math.round(
          Math.max(
            -90,
            Math.min(90, rotate3DStart.current.initialRotateY + dx),
          ),
        );
        setState((prev) => ({
          ...prev,
          rotateX: newX,
          rotateY: newY,
        }));
      }
    };

    const handlePointerUp = () => {
      if (isDragging.current) {
        setShowGuides({ x: false, y: false });
        if (dragInitialState.current) commit((prev) => prev);
        isDragging.current = false;
        dragInitialState.current = null;
      }
      if (isRotating.current) {
        setSnappedAngle(null);
        if (rotateInitialState.current) commit((prev) => prev);
        isRotating.current = false;
        rotateInitialState.current = null;
      }
      if (isScaling.current) {
        if (scaleInitialState.current) commit((prev) => prev);
        isScaling.current = false;
        scaleInitialState.current = null;
      }
      if (is3DRotating.current) {
        if (rotate3DInitialState.current) commit((prev) => prev);
        is3DRotating.current = false;
        rotate3DInitialState.current = null;

        if (handleTimeoutRef.current) clearTimeout(handleTimeoutRef.current);
        handleTimeoutRef.current = setTimeout(() => {
          setShowHandles(false);
        }, 3000);
      }
      document.body.style.cursor = "default";
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const container = (e.target as HTMLElement).closest(
        "[data-transform-container]",
      );
      if (!container) {
        setShowHandles(false);
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    document.addEventListener("mousedown", handleGlobalClick);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("mousedown", handleGlobalClick);
      if (handleTimeoutRef.current) clearTimeout(handleTimeoutRef.current);
    };
  }, [commit, setState]);

  const desktopCanvasRef = useRef<HTMLDivElement>(null);
  const mobileCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelDragState = useRef<{
    startY: number;
    startOpen: boolean;
    velocity: number;
    lastY: number;
    lastTime: number;
  } | null>(null);
  const [panelDragOffset, setPanelDragOffset] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resetHistory(mergeStateWithNewImage(state, e.target?.result as string));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resetHistory(
              mergeStateWithNewImage(state, e.target?.result as string),
            );
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (
        e.dataTransfer?.items &&
        Array.from(e.dataTransfer.items).some((item) =>
          item.type.startsWith("image/"),
        )
      ) {
        dragCounter++;
        setIsDraggingFile(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingFile(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingFile(false);

      const file = e.dataTransfer?.files?.[0];
      if (file?.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          resetHistory(
            mergeStateWithNewImage(state, event.target?.result as string),
          );
        };
        reader.readAsDataURL(file);
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [resetHistory]);

  const handleNewUploadClick = () => {
    if (state.image) {
      setShowConfirmDialog(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const exportImage = async () => {
    const activeCanvas = desktopCanvasRef.current?.offsetParent
      ? desktopCanvasRef.current
      : mobileCanvasRef.current;
    if (activeCanvas) {
      exportImageUtil(activeCanvas);
    }
  };

  const copyImage = async () => {
    if (isCopying) return;
    const activeCanvas = desktopCanvasRef.current?.offsetParent
      ? desktopCanvasRef.current
      : mobileCanvasRef.current;
    if (activeCanvas) {
      setIsCopying(true);
      setCopyMessage("Copying...");
      const success = await copyImageUtil(activeCanvas);
      setIsCopying(false);
      setCopyMessage(success ? "Copied!" : "Failed!");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          if (state.image) {
            copyImage();
          }
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          if (state.image) {
            exportImage();
          }
        }
      }

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setCanvasZoom((z) => Math.min(3, z + 0.1));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setCanvasZoom((z) => Math.max(0.1, z - 0.1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.image, undo, redo, copyImage, exportImage, setCanvasZoom]);

  const shadowString = state.shadows
    .filter((s) => s.enabled)
    .map((s) => {
      const r = Number.parseInt(s.color.slice(1, 3), 16);
      const g = Number.parseInt(s.color.slice(3, 5), 16);
      const b = Number.parseInt(s.color.slice(5, 7), 16);
      return `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${s.opacity})`;
    })
    .join(", ");

  const tabs = [
    { id: "background" as TabType, label: "Background", icon: Palette },
    { id: "styling" as TabType, label: "Transform", icon: Maximize },
    { id: "shadow" as TabType, label: "Shadow", icon: Layers },
    { id: "border" as TabType, label: "Border", icon: Frame },
    { id: "window" as TabType, label: "Window", icon: PanelTop },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab) {
      case "background":
        return (
          <BackgroundControls
            state={state}
            setState={setState}
            commit={commit}
          />
        );
      case "styling":
        return (
          <TransformControls
            state={state}
            setState={setState}
            commit={commit}
            onCropClick={() => setShowCropTool(true)}
            isCropDisabled={!state.image}
          />
        );
      case "shadow":
        return (
          <ShadowControls state={state} setState={setState} commit={commit} />
        );
      case "border":
        return (
          <BorderControls state={state} setState={setState} commit={commit} />
        );
      case "window":
        return (
          <WindowControls state={state} setState={setState} commit={commit} />
        );
      default:
        return null;
    }
  };

  const renderCanvas = (ref: React.RefObject<HTMLDivElement | null>) => (
    <>
      {!state.image ? (
        <div
          className={`text-center text-muted-foreground cursor-pointer rounded-xl p-8 transition-all duration-200 ${isDraggingFile
            ? "bg-primary/5 border-2 border-dashed border-primary scale-105"
            : "hover:bg-accent/20"
            }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${isDraggingFile ? "text-primary animate-bounce opacity-100" : "opacity-30"}`}
          />
          <p
            className={`text-lg font-medium ${isDraggingFile ? "text-primary" : ""}`}
          >
            {isDraggingFile
              ? "Drop image here"
              : "Upload, paste or drop an image to get started"}
          </p>
          <p className="text-sm mt-2 text-muted-foreground/60">
            Shortcuts: Ctrl+C (Copy), Ctrl+S (Export), Ctrl+V (Paste)
          </p>
        </div>
      ) : (
        <div
          ref={ref}
          className={`relative overflow-hidden flex items-center justify-center select-none ${state.aspectRatio === "auto" ? "" : "w-[800px]"}`}
          style={{
            padding: `${state.padding}px`,
            aspectRatio:
              state.aspectRatio === "auto"
                ? "auto"
                : state.aspectRatio.replace(":", "/"),
            touchAction: "none",
            perspective:
              state.rotateX || state.rotateY || state.rotateZ
                ? `${state.perspective}px`
                : undefined,
            transformStyle:
              state.rotateX || state.rotateY || state.rotateZ
                ? "preserve-3d"
                : undefined,
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            isDragging.current = true;
            dragInitialState.current = state;
            dragStart.current = {
              x: e.clientX - state.positionX * canvasZoomRef.current,
              y: e.clientY - state.positionY * canvasZoomRef.current,
            };

            setShowHandles(true);
            if (handleTimeoutRef.current)
              clearTimeout(handleTimeoutRef.current);
            handleTimeoutRef.current = setTimeout(() => {
              setShowHandles(false);
            }, 3000);
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              background: state.background.value,
              filter:
                state.backgroundBlur > 0
                  ? `blur(${state.backgroundBlur}px)`
                  : undefined,
              inset:
                state.backgroundBlur > 0 ? `-${state.backgroundBlur}px` : 0,
            }}
          />
          {state.backgroundTintOpacity > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: state.backgroundTintColor,
                opacity: state.backgroundTintOpacity,
              }}
            />
          )}
          <WindowStackComponent
            stack={state.stack}
            frameProps={{
              type: state.frame.type,
              darkMode: state.frameDarkMode,
              borderRadius: state.borderRadius,
              borderWidth: state.border.width,
              borderColor: state.border.color,
              address: state.address,
            }}
            image={state.image!}
            scale={state.scale}
            rotation={state.rotation}
            shadowString={shadowString}
            positionX={state.positionX}
            positionY={state.positionY}
            rotateX={state.rotateX}
            rotateY={state.rotateY}
            rotateZ={state.rotateZ}
            showHandles={showHandles}
            flipX={state.flipX}
            flipY={state.flipY}
            onScaleStart={(e: React.PointerEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              isScaling.current = true;
              scaleInitialState.current = state;
              const container = (e.target as HTMLElement).closest(
                "[data-transform-container]",
              );
              if (container) {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const initialDistance = Math.sqrt(dx * dx + dy * dy);
                scaleStart.current = {
                  centerX,
                  centerY,
                  initialDistance,
                  initialScale: state.scale,
                };
              }
              document.body.style.cursor = "nwse-resize";
            }}
            onRotateStart={(e: React.PointerEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              isRotating.current = true;
              rotateInitialState.current = state;
              const container = (e.target as HTMLElement).closest(
                "[data-transform-container]",
              );
              if (container) {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const initialAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                rotateStart.current = {
                  centerX,
                  centerY,
                  initialAngle,
                  initialRotation: state.rotation,
                };
              }
              document.body.style.cursor = "grabbing";
            }}
            on3DRotateStart={(e: React.PointerEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              is3DRotating.current = true;
              rotate3DInitialState.current = state;
              rotate3DStart.current = {
                x: e.clientX,
                y: e.clientY,
                initialRotateX: state.rotateX,
                initialRotateY: state.rotateY,
              };
              document.body.style.cursor = "grabbing";
            }}
          />

          {(showGuides.x || showGuides.y) && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible"
              preserveAspectRatio="none"
            >
              {showGuides.x && (
                <line
                  x1="50%"
                  y1="0"
                  x2="50%"
                  y2="100%"
                  stroke="#ff3b3b"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {showGuides.y && (
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="#ff3b3b"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
          )}

          {snappedAngle !== null && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <div className="bg-[#ff3b3b] text-white text-[11px] font-mono font-medium px-2.5 py-1 rounded-full shadow-lg">
                {snappedAngle}°
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderTabButton = (
    tab: (typeof tabs)[0],
    layout: "sidebar" | "bottom",
  ) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    if (layout === "sidebar") {
      return (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl transition-all w-full ${isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          title={tab.label}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">
            {tab.label}
          </span>
        </button>
      );
    }

    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg transition-all ${isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{tab.label}</span>
      </button>
    );
  };

  return (
    <>
      <div className="h-screen bg-background/80 backdrop-blur-sm text-foreground flex flex-col">
        <header className="border-b border-border/50 bg-background/30 backdrop-blur-md shadow-lg flex-shrink-0">
          <div className="px-1.5 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="Screen Pastel"
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              <h1 className="text-[10px] sm:text-[11px] font-bold leading-none flex flex-col uppercase tracking-wider">
                <span>Screen</span>
                <span className="text-primary">Pastel</span>
              </h1>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2">
              <About />
              <div className="h-4 w-px bg-border mx-0.5 sm:mx-1" />
              <Button
                variant="ghost"
                onClick={undo}
                disabled={!canUndo}
                className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground/40 px-1 sm:px-2"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={redo}
                disabled={!canRedo}
                className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground/40 px-1 sm:px-2"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <div className="h-4 w-px bg-border mx-0.5 sm:mx-1" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                onClick={handleNewUploadClick}
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-1 sm:px-3"
              >
                {state.image ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {state.image ? "Remove" : "Upload"}
                </span>
              </Button>
              <Button
                variant="ghost"
                onClick={copyImage}
                disabled={!state.image || isCopying}
                className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground px-1 sm:px-3"
              >
                {isCopying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copyMessage === "Copied!" ? (
                  <Check className="w-4 h-4" />
                ) : copyMessage === "Failed!" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {copyMessage || "Copy"}
                </span>
              </Button>
              <Button
                onClick={exportImage}
                disabled={!state.image}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground px-1.5 sm:px-3"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="hidden md:flex flex-1 overflow-hidden">
          <aside className="flex flex-shrink-0 border-r border-border/50 bg-background/30 backdrop-blur-md h-full">
            <nav className="flex flex-col gap-0.5 p-1.5 w-[72px] border-r border-border/30">
              {tabs.map((tab) => renderTabButton(tab, "sidebar"))}
            </nav>

            {activeTab && (
              <div
                key={activeTab}
                className="w-[300px] overflow-y-auto sidebar-scroll select-none"
              >
                <div className="p-4">
                  <h2 className="text-base font-semibold text-foreground mb-4">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </h2>
                  {renderTabContent()}
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1 p-8 flex items-center justify-center bg-background/50 backdrop-blur-sm relative overflow-hidden">
            <FloatingToolbar
              state={state}
              commit={commit}
              setShowCropTool={setShowCropTool}
            />
            <div
              className="origin-center"
              style={{
                transform: state.image ? `scale(${canvasZoom})` : "none",
              }}
            >
              {renderCanvas(desktopCanvasRef)}
            </div>

            <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-lg select-none">
              <button
                onClick={() => setCanvasZoom((z) => Math.max(0.1, z - 0.1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <Slider
                value={[canvasZoom * 100]}
                onValueChange={(val) => setCanvasZoom(val[0] / 100)}
                min={10}
                max={300}
                step={1}
                className="w-24"
              />
              <button
                onClick={() => setCanvasZoom((z) => Math.min(3, z + 0.1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span
                className="text-xs font-medium w-10 text-right cursor-pointer hover:text-primary transition-colors"
                onClick={() => setCanvasZoom(1)}
                title="Reset zoom"
              >
                {Math.round(canvasZoom * 100)}%
              </span>
            </div>
          </main>
        </div>

        <main className="md:hidden flex-1 p-2 pb-36 flex items-center justify-center bg-background/50 backdrop-blur-sm relative overflow-hidden">
          <FloatingToolbar
            state={state}
            commit={commit}
            setShowCropTool={setShowCropTool}
          />
          <div
            className="origin-center"
            style={{
              transform: state.image
                ? `scale(${state.aspectRatio === "auto" ? canvasZoom * 0.75 : canvasZoom})`
                : "none",
            }}
          >
            {renderCanvas(mobileCanvasRef)}
          </div>

          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-lg select-none">
            <button
              onClick={() => setCanvasZoom((z) => Math.max(0.1, z - 0.1))}
              className="text-muted-foreground hover:text-foreground"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span
              className="text-xs font-medium w-9 text-center cursor-pointer hover:text-primary transition-colors"
              onClick={() => setCanvasZoom(1)}
            >
              {Math.round(canvasZoom * 100)}%
            </span>
            <button
              onClick={() => setCanvasZoom((z) => Math.min(3, z + 0.1))}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </main>
      </div>

      <div
        className="md:hidden fixed inset-0 z-10"
        aria-hidden="true"
        style={{
          pointerEvents: activeTab && panelDragOffset === 0 ? "auto" : "none",
        }}
        onPointerDown={() => setActiveTab(null)}
      />

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border/30 bg-background backdrop-blur-xl shadow-2xl shadow-black/20 mobile-controls-container rounded-t-xl"
        style={{
          transform: `translateY(${Math.max(0, panelDragOffset)}px)`,
          transition: panelDragOffset > 0 ? "none" : "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div
          className="w-full flex justify-center py-2.5 touch-none select-none cursor-grab active:cursor-grabbing mobile-drag-handle"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            panelDragState.current = {
              startY: e.clientY,
              startOpen: !!activeTab,
              velocity: 0,
              lastY: e.clientY,
              lastTime: Date.now(),
            };
            setPanelDragOffset(0);
          }}
          onPointerMove={(e) => {
            if (!panelDragState.current) return;
            const now = Date.now();
            const dt = now - panelDragState.current.lastTime;
            if (dt > 0) {
              panelDragState.current.velocity =
                (e.clientY - panelDragState.current.lastY) / dt;
            }
            panelDragState.current.lastY = e.clientY;
            panelDragState.current.lastTime = now;
            setPanelDragOffset(Math.max(0, e.clientY - panelDragState.current.startY));
          }}
          onPointerUp={(e) => {
            if (!panelDragState.current) return;
            const delta = e.clientY - panelDragState.current.startY;
            const velocity = panelDragState.current.velocity;
            const wasOpen = panelDragState.current.startOpen;
            panelDragState.current = null;
            setPanelDragOffset(0);

            if (wasOpen && (delta > 80 || velocity > 0.5)) {
              setActiveTab(null);
            } else if (!wasOpen && (delta < -80 || velocity < -0.5)) {
              setActiveTab("background");
            }
          }}
          onPointerCancel={() => {
            panelDragState.current = null;
            setPanelDragOffset(0);
          }}
        >
          <div
            className={`h-1.5 rounded-full transition-all duration-200 ${
              activeTab && panelDragOffset <= 20
                ? "w-12 bg-muted-foreground/50"
                : "w-8 bg-muted-foreground/30"
            }`}
          />
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            activeTab ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
          } ${!mounted ? "max-md:max-h-0 max-md:opacity-0" : ""}`}
        >
          <div
            key={activeTab ?? "none"}
            className="px-4 pb-3 max-h-[50vh] overflow-y-auto sidebar-scroll select-none mobile-controls-content"
          >
            {activeTab && renderTabContent()}
          </div>
        </div>

        <div
          className={`flex items-center justify-around gap-0 px-1 py-2 mobile-tabs-container transition-colors ${activeTab ? "border-t border-border/50" : ""
            }`}
        >
          {tabs.map((tab) => renderTabButton(tab, "bottom"))}
        </div>
      </div>

      {showCropTool && state.image && (
        <CropTool
          imageSrc={state.image}
          onApply={(croppedImage) => {
            commit((prev) => ({ ...prev, image: croppedImage }));
            setShowCropTool(false);
          }}
          onCancel={() => setShowCropTool(false)}
        />
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove current image?</DialogTitle>
            <DialogDescription>
              This will remove your current image and return you to the upload
              screen. You won't be able to recover your changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetHistory(mergeStateWithNewImage(state, null));
                setShowConfirmDialog(false);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
