"use client";

import { Check, Upload } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import type { EditorState } from "../lib/types";

export default function ImageControls({
    state,
    setState,
}: {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}) {
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleCustomImageClick = () => {
        imageInputRef.current?.click();
    };

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

    return (
        <div className="space-y-1.5">
            <div className="flex flex-col items-center gap-1">
                <button
                    onClick={handleCustomImageClick}
                    className={`mt-1 w-12 h-8 rounded-none transition-all flex-shrink-0 flex items-center justify-center group relative ${state.background.id === "custom-image"
                        ? "ring-2 ring-primary/20"
                        : "hover:ring-1 hover:ring-muted"
                        }`}
                    style={{
                        background: state.background.id === "custom-image"
                            ? state.background.value
                            : "linear-gradient(45deg, #f0f0f0 0%, #e0e0e0 100%)",
                    }}
                    title="Custom Image"
                >
                    <Upload className="w-3 h-3 text-muted-foreground group-hover:text-white transition-colors" />
                    {state.background.id === "custom-image" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white drop-shadow-lg" />
                        </div>
                    )}
                    <div className="absolute inset-0 rounded-none bg-black opacity-0 group-hover:opacity-25 transition-opacity"></div>
                </button>
                <span className="text-xs text-muted-foreground text-center">
                    Image
                </span>
            </div>

            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
}
