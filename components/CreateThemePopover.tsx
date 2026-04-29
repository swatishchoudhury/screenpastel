"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildGradient } from "@/lib/gradientUtils";
import type { GradientConfig, Theme } from "@/lib/types";
import GradientEditor from "./GradientEditor";

interface CreateThemePopoverProps {
  currentGradient: GradientConfig;
  onSave: (theme: Omit<Theme, "id">) => void;
}

export default function CreateThemePopover({
  currentGradient,
  onSave,
}: CreateThemePopoverProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<GradientConfig>(currentGradient);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setConfig(currentGradient);
      setName("");
      setError("");
    }
  }, [open, currentGradient]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    onSave({
      name: trimmed,
      direction: config.direction,
      stops: config.stops,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2 gap-1 bg-white/50 hover:bg-white/80"
        >
          <Plus className="w-3.5 h-3.5" /> Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create Custom Theme</DialogTitle>
          <DialogDescription>
            Create and save your custom gradient theme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Theme Name</span>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="E.g., Sunset Vibes"
              className={error ? "border-destructive" : ""}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Preview</span>
            <div
              className="w-full h-14 rounded-md shadow-inner border border-border/50"
              style={{ background: buildGradient(config) }}
            />
          </div>

          <GradientEditor
            config={config}
            onChange={setConfig}
            onCommit={setConfig}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Theme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
