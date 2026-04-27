"use client";
import { Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function About() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-accent px-1 sm:px-2"
          title="About"
        >
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Screen Pastel" className="w-5 h-5" />
              <div className="text-[10px] font-bold leading-none flex flex-col uppercase tracking-wider text-left">
                <span>Screen</span>
                <span className="text-primary">Pastel</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-left">
            Create beautiful screenshots
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Undo</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+Z
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Redo</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+Shift+Z
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Copy Image</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+C
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Export Image
              </span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+S
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Paste Image</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+V
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Zoom In</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                +
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Zoom Out</span>
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                -
              </kbd>
            </div>
          </div>

          <div className="pt-2 border-t">
            <a
              href="https://github.com/swatishchoudhury/screenpastel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              swatishchoudhury/screenpastel
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
