"use client";
import { Github } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function About() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    About
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center gap-2">
                            <img src="/favicon.ico" alt="" className="w-4 h-4" />
                            Screen Pastel
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Create beautiful screenshots
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Copy Image</span>
                            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+C</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Export Image</span>
                            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+S</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Paste Image</span>
                            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+V</kbd>
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