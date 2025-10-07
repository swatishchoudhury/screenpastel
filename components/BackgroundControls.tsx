"use client";
import type React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import GradientControls from "./GradientControls";
import ImageControls from "./ImageControls";
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
            <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max">
                    <ImageControls state={state} setState={setState} />
                    <div className="border-l border-muted-foreground/20 h-14"></div>
                    <GradientControls state={state} setState={setState} />
                </div>
            </div>
            {state.background.type === "gradient" && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Direction</Label>
                    <div className="flex items-center gap-2">
                        <Slider
                            value={[state.gradientDirection]}
                            onValueChange={([value]) =>
                                setState((prev) => {
                                    const newDirection = value;
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
                            step={1}
                            className="max-w-1/4"
                        />
                        <div className="text-xs text-muted-foreground w-12 text-center">
                            {state.gradientDirection}°
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
