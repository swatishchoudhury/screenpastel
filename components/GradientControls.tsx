"use client";

import { Check, Pencil, Save, Trash2 } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { BACKGROUNDS } from "../lib/data";
import type { Background, EditorState, Theme } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const createGradientValue = (direction: number, color1: string, color2: string): string =>
    `linear-gradient(${direction}deg, ${color1} 0%, ${color2} 100%)`;

const STORAGE_KEY = "customThemes";

export default function GradientControls({
    state,
    setState,
}: {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
    const [showCustomGradient, setShowCustomGradient] = useState(false);
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [themeName, setThemeName] = useState("");
    const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string>("");

    const presetGradients = BACKGROUNDS.filter(bg => bg.type === "gradient");

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setCustomThemes(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error("Failed to load custom themes:", error);
            localStorage.removeItem(STORAGE_KEY);
            setCustomThemes([]);
        }
    }, []);

    const saveToLocalStorage = (themes: Theme[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
        } catch (error) {
            console.error("Failed to save custom themes:", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                setSaveError("Storage is full. Please delete some themes.");
            } else {
                setSaveError("Failed to save theme. Please try again.");
            }
            throw error;
        }
    };

    const handleSaveClick = () => {
        setThemeName(`Theme ${customThemes.length + 1}`);
        setSaveError("");
        setShowSaveDialog(true);
    };

    const saveTheme = () => {
        const trimmedName = themeName.trim();

        if (!trimmedName) {
            setSaveError("Theme name cannot be empty");
            return;
        }

        if (customThemes.some(t => t.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
            setSaveError("A theme with this name already exists");
            return;
        }

        const newTheme: Theme = {
            id: Date.now().toString(),
            name: trimmedName,
            color1: state.customGradient.color1,
            color2: state.customGradient.color2,
            direction: state.gradientDirection,
        };

        const updated = [...customThemes, newTheme];

        try {
            saveToLocalStorage(updated);
            setCustomThemes(updated);
            setShowSaveDialog(false);
            setThemeName("");
            setSaveError("");
        } catch (error) {
            // Error already handled in saveToLocalStorage
        }
    };

    const handleDeleteClick = (id: string) => {
        setThemeToDelete(id);
    };

    const confirmDelete = () => {
        if (themeToDelete) {
            const updated = customThemes.filter((t) => t.id !== themeToDelete);
            setCustomThemes(updated);
            saveToLocalStorage(updated);
            setThemeToDelete(null);
        }
    };

    const applyTheme = (theme: Theme) => {
        setState((prev) => ({
            ...prev,
            customGradient: { color1: theme.color1, color2: theme.color2 },
            gradientDirection: theme.direction,
            background: {
                id: "custom",
                name: "Custom",
                type: "gradient",
                value: createGradientValue(theme.direction, theme.color1, theme.color2),
            },
        }));
        setShowCustomGradient(true);
    };

    const applyBackground = (bg: Background) => {
        let direction = state.gradientDirection;
        if (bg.type === "gradient") {
            const match = bg.value.match(/linear-gradient\((\d+)deg,/);
            if (match) {
                direction = parseInt(match[1], 10);
            }
        }
        setState((prev) => ({
            ...prev,
            background: bg,
            gradientDirection: direction,
        }));
        if (bg.id !== "custom") {
            setShowCustomGradient(false);
        }
    };

    const handleCustomButtonClick = () => {
        setState((prev) => ({
            ...prev,
            background: {
                id: "custom",
                name: "Custom",
                type: "gradient",
                value: createGradientValue(
                    prev.gradientDirection,
                    state.customGradient.color1,
                    state.customGradient.color2
                ),
            },
        }));
        setShowCustomGradient(!showCustomGradient);
    };

    const handleColor1Change = (color: string) => {
        setState((prev) => ({
            ...prev,
            customGradient: {
                ...prev.customGradient,
                color1: color,
            },
            background: {
                id: "custom",
                name: "Custom",
                type: "gradient",
                value: createGradientValue(prev.gradientDirection, color, prev.customGradient.color2),
            },
        }));
    };

    const handleColor2Change = (color: string) => {
        setState((prev) => ({
            ...prev,
            customGradient: {
                ...prev.customGradient,
                color2: color,
            },
            background: {
                id: "custom",
                name: "Custom",
                type: "gradient",
                value: createGradientValue(prev.gradientDirection, prev.customGradient.color1, color),
            },
        }));
    };

    const handleThemeNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveTheme();
        }
        if (e.key === "Escape") {
            setShowSaveDialog(false);
            setSaveError("");
        }
    };

    const handleDialogClose = (open: boolean) => {
        setShowSaveDialog(open);
        if (!open) {
            setThemeName("");
            setSaveError("");
        }
    };

    return (
        <div className="space-y-1.5">
            <div className="overflow-x-auto pb-1 px-1">
                <div className="flex gap-2 min-w-max">
                    <div
                        className={`flex flex-col gap-1 transition-all ${showCustomGradient ? "rounded-lg bg-secondary/100" : ""
                            }`}
                    >
                        <div className="flex gap-2">
                            <div className="flex flex-col items-center gap-1 w-12">
                                <button
                                    onClick={handleCustomButtonClick}
                                    className={`mt-1 w-12 h-8 rounded-none transition-all flex-shrink-0 flex items-center justify-center group relative ${showCustomGradient
                                        ? "ring-2 ring-primary/20"
                                        : "hover:ring-1 hover:ring-muted"
                                        }`}
                                    style={{
                                        background: createGradientValue(
                                            state.gradientDirection,
                                            state.customGradient.color1,
                                            state.customGradient.color2
                                        ),
                                    }}
                                    title="Custom Gradient"
                                >
                                    {showCustomGradient ? (
                                        <Check className="w-3 h-3 text-white drop-shadow-lg" />
                                    ) : (
                                        <Pencil className="w-3 h-3 text-white drop-shadow-lg" />
                                    )}
                                    <div className="absolute inset-0 rounded-none bg-black opacity-0 group-hover:opacity-25 transition-opacity"></div>
                                </button>
                                <span className="text-xs text-muted-foreground text-center truncate w-full">
                                    Custom
                                </span>
                            </div>

                            {showCustomGradient && (
                                <>
                                    <div className="flex flex-col items-center gap-1 w-12">
                                        <input
                                            type="color"
                                            value={state.customGradient.color1}
                                            onChange={(e) => handleColor1Change(e.target.value)}
                                            className="mt-1 w-12 h-8 rounded-none cursor-pointer hover:ring-1 hover:ring-muted"
                                            title="Custom Gradient Color 1"
                                        />
                                        <span className="text-xs text-muted-foreground text-center truncate w-full">
                                            Color 1
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 w-12">
                                        <input
                                            type="color"
                                            value={state.customGradient.color2}
                                            onChange={(e) => handleColor2Change(e.target.value)}
                                            className="mt-1 w-12 h-8 rounded-none cursor-pointer hover:ring-1 hover:ring-muted"
                                            title="Custom Gradient Color 2"
                                        />
                                        <span className="text-xs text-muted-foreground text-center truncate w-full">
                                            Color 2
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 w-12">
                                        <Button
                                            onClick={handleSaveClick}
                                            size="icon"
                                            className="mt-1 w-8 h-8"
                                            title="Save Theme"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground text-center truncate w-full">
                                            Save
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {presetGradients.map((bg) => (
                        <div key={bg.id} className="flex flex-col items-center gap-1 w-12">
                            <button
                                onClick={() => applyBackground(bg)}
                                className={`mt-1 w-12 h-8 rounded-none transition-all flex-shrink-0 relative group ${state.background.id === bg.id
                                    ? "ring-2 ring-primary/20"
                                    : "hover:ring-1 hover:ring-muted"
                                    }`}
                                style={{ background: bg.value }}
                                title={bg.name}
                            >
                                {state.background.id === bg.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white drop-shadow-lg" />
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-none bg-black opacity-0 group-hover:opacity-25 transition-opacity"></div>
                            </button>
                            <span className="text-xs text-muted-foreground text-center w-full">
                                {bg.name}
                            </span>
                        </div>
                    ))}

                    {customThemes.length > 0 && (
                        <div className="border-l border-muted-foreground/20 h-14 mx-1" />
                    )}

                    {customThemes.map((theme) => (
                        <div key={theme.id} className="flex flex-col items-center gap-1 w-12">
                            <div className="relative">
                                <button
                                    onClick={() => applyTheme(theme)}
                                    className="mt-1 w-12 h-8 rounded-none transition-all flex-shrink-0 relative group hover:ring-1 hover:ring-muted"
                                    style={{
                                        background: createGradientValue(theme.direction, theme.color1, theme.color2),
                                    }}
                                    title={theme.name}
                                >
                                    <div className="absolute inset-0 rounded-none bg-black opacity-0 group-hover:opacity-25 transition-opacity"></div>
                                </button>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(theme.id);
                                    }}
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-0 -right-1 w-4 h-4 rounded-full shadow-md z-10 cursor-pointer"
                                    title="Delete Theme"
                                >
                                    <Trash2 className="size-[11px]" />
                                </Button>
                            </div>
                            <span className="text-xs text-muted-foreground text-center w-full truncate">
                                {theme.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={showSaveDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Save Theme</DialogTitle>
                        <DialogDescription>
                            Enter a name for your custom gradient theme.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Input
                                id="theme-name"
                                value={themeName}
                                onChange={(e) => {
                                    setThemeName(e.target.value);
                                    setSaveError("");
                                }}
                                onKeyDown={handleThemeNameKeyDown}
                                placeholder="Enter theme name"
                                autoFocus
                                className={saveError ? "border-destructive" : ""}
                            />
                            {saveError && (
                                <p className="text-sm text-destructive">{saveError}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => handleDialogClose(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={saveTheme}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={themeToDelete !== null}
                onOpenChange={(open) => !open && setThemeToDelete(null)}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Theme</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this theme? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setThemeToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}