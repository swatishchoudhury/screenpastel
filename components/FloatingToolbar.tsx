import { Crop, FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditorState } from "../lib/types";

interface FloatingToolbarProps {
  state: EditorState;
  commit: (update: EditorState | ((prev: EditorState) => EditorState)) => void;
  setShowCropTool: (show: boolean) => void;
}

export function FloatingToolbar({
  state,
  commit,
  setShowCropTool,
}: FloatingToolbarProps) {
  if (!state.image) return null;
  return (
    <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 bg-background/80 backdrop-blur-md px-2 sm:px-3 py-1.5 rounded-full border border-border/50 shadow-lg select-none pointer-events-auto">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground hover:bg-accent/50 w-8 h-8 p-0 rounded-full"
        onClick={() => setShowCropTool(true)}
        title="Crop image"
      >
        <Crop className="w-4 h-4" />
      </Button>
      <div className="w-px h-4 bg-border/50 mx-0.5 sm:mx-1"></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 w-8 h-8 p-0 rounded-full"
            title="Flip options"
          >
            <FlipHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem
            onClick={() => commit((prev) => ({ ...prev, flipX: !prev.flipX }))}
          >
            <FlipHorizontal className="w-4 h-4 mr-2" /> Flip horizontal
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => commit((prev) => ({ ...prev, flipY: !prev.flipY }))}
          >
            <FlipVertical className="w-4 h-4 mr-2" /> Flip vertical
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
