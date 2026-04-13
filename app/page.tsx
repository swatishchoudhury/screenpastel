"use client";

import {
  AlertTriangle,
  Box,
  Check,
  Copy,
  Download,
  Frame,
  Layers,
  Palette,
  Move,
  Upload,
} from "lucide-react";
import About from "../components/About";
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
import BackgroundControls from "../components/BackgroundControls";
import BorderControls from "../components/BorderControls";
import ShadowControls from "../components/ShadowControls";
import StylingControls from "../components/StylingControls";
import WindowControls from "../components/WindowControls";
import WindowStackComponent from "../components/WindowStackComponent";
import { BACKGROUNDS, FRAMES } from "../lib/data";
import type { EditorState } from "../lib/types";
import { exportImage as exportImageUtil, copyImage as copyImageUtil } from "../lib/imageExporter";

type TabType = "background" | "styling" | "shadow" | "border" | "window";

export default function ScreenshotEditor() {
  const [activeTab, setActiveTab] = useState<TabType | null>("background");
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [state, setState] = useState<EditorState>({
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
    customGradient: { color1: "#ff9a9e", color2: "#fecfef" },
    gradientDirection: 135,
    address: "https://screenpastel.vercel.app",
    backgroundTintColor: "#000000",
    backgroundTintOpacity: 0,
    backgroundBlur: 0,
    positionX: 0,
    positionY: 0,
    aspectRatio: "auto",
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isScaling = useRef(false);
  const scaleStart = useRef({ centerX: 0, centerY: 0, initialDistance: 0, initialScale: 1 });
  const isRotating = useRef(false);
  const rotateStart = useRef({ centerX: 0, centerY: 0, initialAngle: 0, initialRotation: 0 });
  const [showGuides, setShowGuides] = useState({ x: false, y: false });

  const DRAG_SNAP_THRESHOLD = 6;
  const ROTATION_SNAP_POINTS = [0, 45, 90, 135, 180, 270, 360, -45, -90, -135, -180, -270, -360];
  const ROTATION_SNAP_THRESHOLD = 3;
  const [snappedAngle, setSnappedAngle] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        let newX = e.clientX - dragStart.current.x;
        let newY = e.clientY - dragStart.current.y;
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
        const { centerX, centerY, initialDistance, initialScale } = scaleStart.current;
        if (initialDistance === 0) return;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const newScale = Math.max(0.1, Math.min(3, initialScale * (currentDistance / initialDistance)));
        setState((prev) => ({
          ...prev,
          scale: Number(newScale.toFixed(2)),
        }));
      } else if (isRotating.current) {
        const { centerX, centerY, initialAngle, initialRotation } = rotateStart.current;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let newRotation = initialRotation + (currentAngle - initialAngle);
        // Snap rotation
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
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        setShowGuides({ x: false, y: false });
      }
      if (isRotating.current) {
        setSnappedAngle(null);
      }
      isDragging.current = false;
      if (isScaling.current) {
        isScaling.current = false;
        document.body.style.cursor = 'default';
      }
      if (isRotating.current) {
        isRotating.current = false;
        document.body.style.cursor = 'default';
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState((prev) => ({ ...prev, image: e.target?.result as string }));
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
            setState((prev) => ({
              ...prev,
              image: e.target?.result as string,
            }));
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          if (state.image) {
            copyImage();
          }
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          if (state.image) {
            exportImage();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.image]);

  const handleNewUploadClick = () => {
    if (state.image) {
      setShowConfirmDialog(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const exportImage = async () => {
    if (canvasRef.current) {
      exportImageUtil(canvasRef.current);
    }
  };

  const copyImage = async () => {
    if (canvasRef.current) {
      const success = await copyImageUtil(canvasRef.current);
      setCopyMessage(success ? "Copied!" : "Failed!");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

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
    { id: "styling" as TabType, label: "Layout", icon: Move },
    { id: "shadow" as TabType, label: "Shadow", icon: Box },
    { id: "border" as TabType, label: "Border", icon: Frame },
    { id: "window" as TabType, label: "Window", icon: Layers },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab) {
      case "background":
        return <BackgroundControls state={state} setState={setState} />;
      case "styling":
        return <StylingControls state={state} setState={setState} />;
      case "shadow":
        return <ShadowControls state={state} setState={setState} />;
      case "border":
        return <BorderControls state={state} setState={setState} />;
      case "window":
        return <WindowControls state={state} setState={setState} />;
      default:
        return null;
    }
  };

  const renderCanvas = () => (
    <>
      {!state.image ? (
        <div
          className="text-center text-muted-foreground cursor-pointer hover:bg-accent/20 rounded-lg p-8 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">
            Upload or paste an image to get started
          </p>
          <p className="text-sm mt-2 text-muted-foreground/60">
            Shortcuts: Ctrl+C (Copy), Ctrl+S (Export), Ctrl+V (Paste)
          </p>
        </div>
      ) : (
        <div
          ref={canvasRef}
          style={{
            padding: `${state.padding}px`,
            aspectRatio: state.aspectRatio === "auto" ? "auto" : state.aspectRatio.replace(":", "/")
          }}
          className={`relative overflow-hidden flex items-center justify-center select-none ${state.aspectRatio === "auto" ? "" : "w-[800px] max-w-full"}`}
          onMouseDown={(e) => {
            e.preventDefault();
            isDragging.current = true;
            dragStart.current = {
              x: e.clientX - state.positionX,
              y: e.clientY - state.positionY,
            };
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              background: state.background.value,
              filter: state.backgroundBlur > 0 ? `blur(${state.backgroundBlur}px)` : undefined,
              inset: state.backgroundBlur > 0 ? `-${state.backgroundBlur}px` : 0,
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
            onScaleStart={(e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              isScaling.current = true;
              const container = (e.target as HTMLElement).closest('[data-transform-container]');
              if (container) {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const initialDistance = Math.sqrt(dx * dx + dy * dy);
                scaleStart.current = { centerX, centerY, initialDistance, initialScale: state.scale };
              }
              document.body.style.cursor = 'nwse-resize';
            }}
            onRotateStart={(e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              isRotating.current = true;
              const container = (e.target as HTMLElement).closest('[data-transform-container]');
              if (container) {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const initialAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                rotateStart.current = { centerX, centerY, initialAngle, initialRotation: state.rotation };
              }
              document.body.style.cursor = 'grabbing';
            }}
          />


          {(showGuides.x || showGuides.y) && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible" preserveAspectRatio="none">
              {showGuides.x && <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#ff3b3b" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
              {showGuides.y && <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ff3b3b" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
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

  const renderTabButton = (tab: typeof tabs[0], layout: "sidebar" | "bottom") => {
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
          <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
        </button>
      );
    }

    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-all ${isActive
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
          <div className="px-2 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/favicon.ico" alt="Screen Pastel" className="w-5 h-5 sm:w-6 sm:h-6" />
              <h1 className="text-base sm:text-lg font-semibold">Screen Pastel</h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <About />
              <div className="h-4 w-px bg-border mx-1" />
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
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-2 sm:px-3"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{state.image ? "New" : "Upload"}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={copyImage}
                disabled={!state.image}
                className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground px-2 sm:px-3"
              >
                {copyMessage === "Copied!" ? (
                  <Check className="w-4 h-4" />
                ) : copyMessage === "Failed!" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{copyMessage || "Copy"}</span>
              </Button>
              <Button
                onClick={exportImage}
                disabled={!state.image}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground px-2 sm:px-3"
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
              <div className="w-[280px] overflow-y-auto sidebar-scroll">
                <div className="p-4">
                  <h2 className="text-base font-semibold text-foreground mb-4">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </h2>
                  {renderTabContent()}
                </div>
              </div>
            )}
          </aside>


          <main className="flex-1 p-8 flex items-center justify-center bg-background/50 backdrop-blur-sm overflow-hidden">
            <div className="transition-transform duration-200 origin-center">
              {renderCanvas()}
            </div>
          </main>
        </div>


        <main className="md:hidden flex-1 p-2 pb-36 flex items-center justify-center bg-background/50 backdrop-blur-sm overflow-hidden">
          <div className="transform scale-75 transition-transform duration-200 origin-center">
            {renderCanvas()}
          </div>
        </main>
      </div>


      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border/30 bg-background/20 backdrop-blur-xl shadow-2xl shadow-black/20">
        {activeTab && (
          <div className="px-4 py-3 max-h-[50vh] overflow-y-auto sidebar-scroll">{renderTabContent()}</div>
        )}
        <div
          className={`flex items-center justify-center gap-1 px-2 py-2 ${activeTab ? "border-t border-border" : ""} overflow-x-auto`}
        >
          {tabs.map((tab) => renderTabButton(tab, "bottom"))}
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove current image?</DialogTitle>
            <DialogDescription>
              This will remove your current image and return you to the upload screen. You won't be able to recover your changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setState(prev => ({ ...prev, image: null }));
              setShowConfirmDialog(false);
            }}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
