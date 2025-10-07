"use client";

import { Check, Pencil } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { BACKGROUNDS } from "../lib/data";
import type { Background, EditorState } from "../lib/types";

export default function GradientControls({
    state,
    setState,
}: {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
    const [showCustomGradient, setShowCustomGradient] = useState(false);

    const presetGradients = BACKGROUNDS.filter(bg => bg.type === "gradient");

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
                value: `linear-gradient(${prev.gradientDirection}deg, ${state.customGradient.color1} 0%, ${state.customGradient.color2} 100%)`,
            },
        }));
        setShowCustomGradient(!showCustomGradient);
    };

    return (
        <div className="space-y-1.5">
            {/* <Label className="text-xs text-muted-foreground">Gradients</Label> */}
            <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max">
                    <div
                        className={`flex flex-col gap-1 transition-all ${showCustomGradient ? "rounded-lg bg-secondary/100" : ""}`}
                    >
                        <div className="flex gap-2">
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    onClick={handleCustomButtonClick}
                                    className={`mt-1 w-12 h-8 rounded-none transition-all flex-shrink-0 flex items-center justify-center group relative ${showCustomGradient
                                        ? "ring-2 ring-primary/20"
                                        : "hover:ring-1 hover:ring-muted"
                                        }`}
                                    style={{
                                        background: `linear-gradient(${state.gradientDirection}deg, ${state.customGradient.color1} 0%, ${state.customGradient.color2} 100%)`,
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
                                <span className="text-xs text-muted-foreground text-center">
                                    Custom
                                </span>
                            </div>

                            {showCustomGradient && (
                                <>
                                    <div className="flex flex-col items-center gap-1">
                                        <input
                                            type="color"
                                            value={state.customGradient.color1}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    customGradient: {
                                                        ...prev.customGradient,
                                                        color1: e.target.value,
                                                    },
                                                    background: {
                                                        id: "custom",
                                                        name: "Custom",
                                                        type: "gradient",
                                                        value: `linear-gradient(${prev.gradientDirection}deg, ${e.target.value} 0%, ${prev.customGradient.color2} 100%)`,
                                                    },
                                                }))
                                            }
                                            className="mt-1 w-12 h-8 rounded-none cursor-pointer hover:ring-1 hover:ring-muted"
                                            title="Custom Gradient Color 1"
                                        />
                                        <span className="text-xs text-muted-foreground text-center">
                                            Color 1
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <input
                                            type="color"
                                            value={state.customGradient.color2}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    customGradient: {
                                                        ...prev.customGradient,
                                                        color2: e.target.value,
                                                    },
                                                    background: {
                                                        id: "custom",
                                                        name: "Custom",
                                                        type: "gradient",
                                                        value: `linear-gradient(${prev.gradientDirection}deg, ${prev.customGradient.color1} 0%, ${e.target.value} 100%)`,
                                                    },
                                                }))
                                            }
                                            className="mt-1 w-12 h-8 rounded-none cursor-pointer hover:ring-1 hover:ring-muted"
                                            title="Custom Gradient Color 2"
                                        />
                                        <span className="text-xs text-muted-foreground text-center">
                                            Color 2
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {presetGradients.map((bg) => (
                        <div key={bg.id} className="flex flex-col items-center gap-1">
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
                            <span className="text-xs text-muted-foreground text-center">
                                {bg.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
