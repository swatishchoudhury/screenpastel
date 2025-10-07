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
  Sparkles,
  Upload,
} from "lucide-react";
import About from "../components/About";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
        color: "rgba(0,0,0,0.3)",
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
    },
    frameDarkMode: true,
    customGradient: { color1: "#ff9a9e", color2: "#fecfef" },
    gradientDirection: 135,
    address: "https://screenpastel.vercel.app",
    backgroundTintColor: "#000000",
    backgroundTintOpacity: 0,
  });

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
    .map(
      (s) =>
        `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`,
    )
    .join(", ");

  const tabs = [
    { id: "background" as TabType, label: "Background", icon: Palette },
    { id: "styling" as TabType, label: "Styling", icon: Sparkles },
    { id: "shadow" as TabType, label: "Shadow", icon: Box },
    { id: "border" as TabType, label: "Border", icon: Frame },
    { id: "window" as TabType, label: "Window", icon: Layers },
  ];

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
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-2 sm:px-3"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
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

        <main className="flex-1 p-2 pb-36 md:p-8 md:pb-40 flex items-center justify-center bg-background/50 backdrop-blur-sm overflow-hidden">
          <div className="transform scale-75 md:scale-100 transition-transform duration-200 origin-center">
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
                  background: state.background.value,
                  padding: `${state.padding}px`,
                }}
                className="relative"
              >
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
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/30 bg-background/20 backdrop-blur-xl shadow-2xl shadow-black/20">
        {activeTab && (
          <div className="px-4 md:px-8 py-3 md:py-4">{renderTabContent()}</div>
        )}
        <div
          className={`flex items-center justify-center gap-1 px-2 md:px-6 py-2 ${activeTab ? "border-t border-border" : ""} overflow-x-auto`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(activeTab === tab.id ? null : tab.id)
                }
                className={`flex flex-col items-center gap-1.5 px-3 md:px-8 py-2.5 rounded-lg transition-all ${activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
