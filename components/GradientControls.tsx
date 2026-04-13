"use client";

import { Check, Pencil, Save, Trash2 } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import type { Background, EditorState, Theme } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ColorSwatch from "./ColorSwatch";
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
        } catch {
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

    const isCustomActive = state.background.id === "custom";

    return (
        <>

            <button
                onClick={handleCustomButtonClick}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-md transition-all group overflow-hidden ${
                    isCustomActive
                        ? "bg-white shadow-md p-1"
                        : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
                }`}
            >
                <div
                    className="w-full h-14 md:h-[72px] rounded flex flex-col items-center justify-center gap-1 md:gap-2 overflow-hidden"
                    style={{
                        background: createGradientValue(
                            state.gradientDirection,
                            state.customGradient.color1,
                            state.customGradient.color2
                        ),
                    }}
                >
                    {isCustomActive ? (
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white drop-shadow-lg" />
                    ) : (
                        <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80 drop-shadow-lg" />
                    )}
                    <span className="text-[10px] md:text-xs text-white/90 drop-shadow-md font-medium leading-none">Custom</span>
                </div>
            </button>


            {showCustomGradient && (
                <div className="col-span-2 space-y-3 mt-1 p-3 bg-secondary/50 rounded-lg border border-border/40">
                    <div className="space-y-3">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <ColorSwatch
                                    label="Color 1"
                                    value={state.customGradient.color1}
                                    onChange={handleColor1Change}
                                />
                            </div>
                            <Button
                                onClick={handleSaveClick}
                                size="icon"
                                variant="outline"
                                className="w-8 h-8 flex-shrink-0"
                                title="Save Theme"
                            >
                                <Save className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <ColorSwatch
                            label="Color 2"
                            value={state.customGradient.color2}
                            onChange={handleColor2Change}
                        />
                    </div>


                    {customThemes.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-foreground/80 mt-2 block">Saved Themes</span>
                            <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3">
                                {customThemes.map((theme) => {
                                    const themeGradient = createGradientValue(theme.direction, theme.color1, theme.color2);
                                    const isActive = state.background.id === "custom" && state.background.value === themeGradient;
                                    
                                    return (
                                        <div key={theme.id} className="relative group/theme flex flex-col items-center gap-1 md:gap-1.5">
                                            <button
                                                onClick={() => applyTheme(theme)}
                                                className="w-full flex flex-col items-center gap-1 md:gap-1.5 group"
                                            >
                                                <div
                                                    className={`w-full rounded-md transition-all ${
                                                        isActive
                                                            ? "bg-white shadow-md p-1"
                                                            : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
                                                    }`}
                                                >
                                                    <div
                                                        className="w-full aspect-[5/3] md:aspect-[4/3] rounded relative overflow-hidden transition-all"
                                                        style={{ background: themeGradient }}
                                                        title={theme.name}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors text-center w-full block truncate">
                                                    {theme.name}
                                                </span>
                                            </button>

                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(theme.id);
                                                }}
                                                size="icon"
                                                variant="destructive"
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full shadow-md z-10 cursor-pointer opacity-0 group-hover/theme:opacity-100 transition-opacity"
                                                title="Delete Theme"
                                            >
                                                <Trash2 className="size-[11px]" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
        </>
    );
}