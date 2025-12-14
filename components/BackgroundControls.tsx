"use client";
import type React from "react";
import GradientControls from "./GradientControls";
import ImageControls from "./ImageControls";
import Slider from "./Slider";
import type { EditorState } from "../lib/types";

export default function BackgroundControls({
    state,
    setState,
}: {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
    return (
        <>
            <div className="overflow-x-auto pb-1 px-1">
                <div className="flex gap-2 min-w-max">
                    <ImageControls state={state} setState={setState} />
                    <div className="border-l border-muted-foreground/20 h-14"></div>
                    <GradientControls state={state} setState={setState} />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
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
                        label="Direction"
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
        </>
    );
}
