"use client";
import { Check, Pencil, Upload } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSavedThemes } from "@/hooks/useSavedThemes";
import { buildGradient, parseGradient } from "@/lib/gradientUtils";
import { BACKGROUNDS } from "../lib/data";
import type { Background, EditorState } from "../lib/types";
import ColorSwatch from "./ColorSwatch";
import CreateThemePopover from "./CreateThemePopover";
import GradientCard from "./GradientCard";
import GradientEditor from "./GradientEditor";
import Slider from "./Slider";

export default function BackgroundControls({
  state,
  setState,
  commit,
}: {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  commit: (update: EditorState | ((prev: EditorState) => EditorState)) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [solidColor, setSolidColor] = useState("#4A90D9");

  const { themes, saveTheme, deleteTheme } = useSavedThemes();
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const VISIBLE_COUNT = 6;

  const presetGradients = BACKGROUNDS.filter((bg) => bg.type === "gradient");
  const presetSolids = BACKGROUNDS.filter((bg) => bg.type === "solid");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        commit((prev) => ({
          ...prev,
          image: imageUrl,
          scale: 1,
          rotation: 0,
          positionX: 0,
          positionY: 0,
          aspectRatio: "auto",
          flipX: false,
          flipY: false,
          perspective: 1000,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
        }));
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const applyPresetGradient = (bg: Background) => {
    const parsed = parseGradient(bg.value);
    commit((prev) => ({
      ...prev,
      background: bg,
      gradient: parsed,
    }));
  };

  const applySavedTheme = (theme: any) => {
    const gradientConfig = { direction: theme.direction, stops: theme.stops };
    commit((prev) => ({
      ...prev,
      background: {
        id: theme.id,
        name: theme.name ?? "",
        type: "gradient",
        value: buildGradient(gradientConfig),
      },
      gradient: gradientConfig,
    }));
  };

  const applySolidColor = (color: string) => {
    setSolidColor(color);
    commit((prev) => ({
      ...prev,
      background: {
        id: "custom-solid",
        name: "Solid",
        type: "solid",
        value: color,
      },
    }));
  };

  const isSelected = (id: string) => state.background.id === id;

  const handleGradientChange = (newConfig: typeof state.gradient) => {
    setState((prev) => ({
      ...prev,
      gradient: newConfig,
      background: {
        ...prev.background,
        value: buildGradient(newConfig),
      },
    }));
  };

  const handleGradientCommit = (newConfig: typeof state.gradient) => {
    commit((prev) => ({
      ...prev,
      gradient: newConfig,
      background: {
        ...prev.background,
        value: buildGradient(newConfig),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Background Image
        </h3>
        <button
          onClick={() => imageInputRef.current?.click()}
          className={`relative flex items-center gap-3 p-2 rounded-lg border transition-all group w-full ${
            isSelected("custom-image")
              ? "bg-white dark:bg-accent border-primary/50 shadow-sm"
              : "bg-white/40 dark:bg-accent/40 border-border/50 hover:bg-white/60 dark:hover:bg-accent/60 hover:border-border"
          }`}
        >
          <div className="w-10 h-10 rounded bg-accent/40 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/60 transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {isSelected("custom-image") ? "Custom Image" : "Upload Image"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              JPG, PNG or SVG
            </div>
          </div>
          {isSelected("custom-image") && (
            <div className="flex-shrink-0 mr-1">
              <Check className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <h3 className="text-sm font-medium text-foreground/80">
              Saved Themes
            </h3>
            <CreateThemePopover
              currentGradient={state.gradient}
              onSave={saveTheme}
            />
          </div>

          {themes.length > 0 && (
            <div className="relative">
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  !showAllSaved && themes.length > VISIBLE_COUNT
                    ? "max-h-[160px] md:max-h-[200px]"
                    : ""
                }`}
              >
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3 mt-2">
                  {themes.map((theme) => (
                    <GradientCard
                      key={theme.id}
                      gradient={buildGradient({
                        direction: theme.direction,
                        stops: theme.stops,
                      })}
                      label={theme.name}
                      isSelected={isSelected(theme.id)}
                      onSelect={() => applySavedTheme(theme)}
                      onDelete={() => setThemeToDelete(theme.id)}
                    />
                  ))}
                </div>
              </div>
              {themes.length > VISIBLE_COUNT && !showAllSaved && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
              )}
              {themes.length > VISIBLE_COUNT && (
                <div
                  className={`flex justify-center ${showAllSaved ? "mt-2" : "-mt-4 relative z-10"}`}
                >
                  <button
                    onClick={() => setShowAllSaved(!showAllSaved)}
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary border border-border/60 px-3 py-1 rounded-full transition-all shadow-sm backdrop-blur-sm"
                  >
                    {showAllSaved ? "Show less" : `Show all (${themes.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
            Presets
          </h3>
          <div className="relative">
            <div
              className={`overflow-hidden transition-all duration-300 ${
                !showAllPresets && presetGradients.length > VISIBLE_COUNT
                  ? "max-h-[160px] md:max-h-[200px]"
                  : ""
              }`}
            >
              <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3 mt-2">
                {presetGradients.map((bg) => (
                  <GradientCard
                    key={bg.id}
                    gradient={bg.value}
                    label={bg.name}
                    isSelected={isSelected(bg.id)}
                    onSelect={() => applyPresetGradient(bg)}
                  />
                ))}
              </div>
            </div>
            {presetGradients.length > VISIBLE_COUNT && !showAllPresets && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            )}
            {presetGradients.length > VISIBLE_COUNT && (
              <div
                className={`flex justify-center ${showAllPresets ? "mt-2" : "-mt-4 relative z-10"}`}
              >
                <button
                  onClick={() => setShowAllPresets(!showAllPresets)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary border border-border/60 px-3 py-1 rounded-full transition-all shadow-sm backdrop-blur-sm"
                >
                  {showAllPresets
                    ? "Show less"
                    : `Show all (${presetGradients.length})`}
                </button>
              </div>
            )}
          </div>
        </div>

        {state.background.type === "gradient" && (
          <div className="space-y-3 pt-2 bg-secondary/30 p-3 rounded-lg border border-border/40">
            <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
              Customize
            </h3>
            <GradientEditor
              config={state.gradient}
              onChange={handleGradientChange}
              onCommit={handleGradientCommit}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Solid Color
        </h3>
        <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3">
          <button
            onClick={() => applySolidColor(solidColor)}
            className="flex flex-col items-center gap-1 md:gap-1.5 group"
          >
            <div
              className={`w-full rounded-md transition-all ${
                isSelected("custom-solid")
? "bg-white dark:bg-accent shadow-md p-1"
                : "bg-white/50 dark:bg-accent/50 shadow-sm hover:shadow-md hover:bg-white/70 dark:hover:bg-accent/70 p-1"
              }`}
            >
              <div
                className="w-full aspect-[5/3] md:aspect-[4/3] rounded relative overflow-hidden flex items-center justify-center"
                style={{ background: solidColor }}
              >
                {isSelected("custom-solid") ? (
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />
                ) : (
                  <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/70 drop-shadow-lg" />
                )}
              </div>
            </div>
            <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
              Custom
            </span>
          </button>

          {presetSolids.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                commit((prev) => ({
                  ...prev,
                  background: bg,
                }));
              }}
              className="flex flex-col items-center gap-1 md:gap-1.5 group"
            >
              <div
                className={`w-full rounded-md transition-all ${
                  isSelected(bg.id)
                    ? "bg-white shadow-md p-1"
                    : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
                }`}
              >
                <div
                  className="w-full aspect-[5/3] md:aspect-[4/3] rounded relative overflow-hidden"
                  style={{ background: bg.value }}
                >
                  {isSelected(bg.id) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                {bg.name}
              </span>
            </button>
          ))}
        </div>

        {isSelected("custom-solid") && (
          <ColorSwatch value={solidColor} onChange={applySolidColor} />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Adjustments
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Blur"
            value={state.backgroundBlur}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, backgroundBlur: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, backgroundBlur: v }))
            }
            min={0}
            max={50}
            unit="px"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">
          Tint Overlay
        </h3>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Slider
            label="Opacity"
            value={state.backgroundTintOpacity}
            onChange={(v: number) =>
              setState((prev) => ({ ...prev, backgroundTintOpacity: v }))
            }
            onCommit={(v: number) =>
              commit((prev) => ({ ...prev, backgroundTintOpacity: v }))
            }
            min={0}
            max={1}
            step={0.01}
          />
          <ColorSwatch
            label="Tint Color"
            value={state.backgroundTintColor}
            onChange={(color) =>
              commit((prev) => ({ ...prev, backgroundTintColor: color }))
            }
          />
        </div>
      </div>

      <Dialog
        open={themeToDelete !== null}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this theme? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThemeToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (themeToDelete) {
                  deleteTheme(themeToDelete);
                  setThemeToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
