"use client";
import type React from "react";
import { Check, Pencil, Upload } from "lucide-react";
import { useRef, useState } from "react";
import GradientControls from "./GradientControls";
import Slider from "./Slider";
import ColorSwatch from "./ColorSwatch";
import type { EditorState, Background } from "../lib/types";
import { BACKGROUNDS } from "../lib/data";

export default function BackgroundControls({
    state,
    setState,
}: {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [solidColor, setSolidColor] = useState("#4A90D9");

    const presetGradients = BACKGROUNDS.filter(bg => bg.type === "gradient");
    const presetSolids = BACKGROUNDS.filter(bg => bg.type === "solid");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setState((prev) => ({
                    ...prev,
                    background: {
                        id: "custom-image",
                        name: "Custom Image",
                        type: "image",
                        value: `url(${imageUrl}) no-repeat center center / cover`,
                    },
                }));
            };
            reader.readAsDataURL(file);
        }
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
    };

    const applySolidColor = (color: string) => {
        setSolidColor(color);
        setState((prev) => ({
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

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => imageInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-md transition-all group ${isSelected("custom-image")
                        ? "bg-white shadow-md p-1"
                        : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
                        }`}
                >
                    <div className="w-full h-14 md:h-[72px] rounded flex flex-col items-center justify-center gap-1 md:gap-2 bg-accent/30">
                        <Upload className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-[10px] md:text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center leading-none">Image</span>
                    </div>
                    {isSelected("custom-image") && (
                        <div className="absolute top-2.5 right-2.5">
                            <Check className="w-3 h-3 text-primary" />
                        </div>
                    )}
                </button>

                <GradientControls state={state} setState={setState} />
            </div>

            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />


            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Gradients </h3>
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3">
                    {presetGradients.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => applyBackground(bg)}
                            className={`flex flex-col items-center gap-1 md:gap-1.5 group`}
                        >
                            <div
                                className={`w-full rounded-md transition-all ${isSelected(bg.id)
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
            </div>


            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Solid Color</h3>
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2 md:gap-3">

                    <button
                        onClick={() => applySolidColor(solidColor)}
                        className="flex flex-col items-center gap-1 md:gap-1.5 group"
                    >
                        <div
                            className={`w-full rounded-md transition-all ${isSelected("custom-solid")
                                ? "bg-white shadow-md p-1"
                                : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
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
                        <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Custom</span>
                    </button>


                    {presetSolids.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => applyBackground(bg)}
                            className="flex flex-col items-center gap-1 md:gap-1.5 group"
                        >
                            <div
                                className={`w-full rounded-md transition-all ${isSelected(bg.id)
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
                    <ColorSwatch
                        value={solidColor}
                        onChange={applySolidColor}
                    />
                )}
            </div>


            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Adjustments</h3>
                <div className="grid grid-cols-1 gap-4 pt-2">
                    <Slider
                        label="Blur"
                        value={state.backgroundBlur}
                        onChange={(v: number) =>
                            setState((prev) => ({ ...prev, backgroundBlur: v }))
                        }
                        min={0}
                        max={50}
                        unit="px"
                    />

                    {state.background.type === "gradient" && (
                        <Slider
                            label="Gradient Direction"
                            value={state.gradientDirection}
                            onChange={(v: number) =>
                                setState((prev) => {
                                    const newDirection = v;
                                    let updatedBackground = prev.background;

                                    if (prev.background.type === "gradient") {
                                        const match = prev.background.value.match(
                                            /linear-gradient\(\d+deg, (.+)\)/,
                                        );
                                        if (match) {
                                            const colors = match[1];
                                            updatedBackground = {
                                                ...prev.background,
                                                value: `linear-gradient(${newDirection}deg, ${colors})`,
                                            };
                                        }
                                    }

                                    return {
                                        ...prev,
                                        gradientDirection: newDirection,
                                        background: updatedBackground,
                                    };
                                })
                            }
                            min={0}
                            max={360}
                            unit="°"
                        />
                    )}
                </div>
            </div>


            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 border-b border-border/50 pb-1">Tint Overlay</h3>
                <div className="grid grid-cols-1 gap-4 pt-2">
                    <Slider
                        label="Opacity"
                        value={state.backgroundTintOpacity}
                        onChange={(v: number) => setState((prev) => ({ ...prev, backgroundTintOpacity: v }))}
                        min={0}
                        max={1}
                        step={0.01}
                    />
                    <ColorSwatch
                        label="Tint Color"
                        value={state.backgroundTintColor}
                        onChange={(color) =>
                            setState((prev) => ({ ...prev, backgroundTintColor: color }))
                        }
                    />
                </div>
            </div>
        </div>
    );
}
