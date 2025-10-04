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
                        Create Beautiful Screenshots
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">GitHub:</span>
                        <a
                            href="https://github.com/swatishchoudhury/screenpastel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <Github className="w-4 h-4" />
                            swatishchoudhury/screenpastel
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">License:</span>
                        <span className="text-sm text-muted-foreground">MIT License</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
