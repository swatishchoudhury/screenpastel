import { Check, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface GradientCardProps {
  gradient: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export default function GradientCard({
  gradient,
  label,
  isSelected,
  onSelect,
  onDelete,
}: GradientCardProps) {
  return (
    <div className="relative group/theme flex flex-col items-center gap-1 md:gap-1.5">
      <button
        onClick={onSelect}
        className="w-full flex flex-col items-center gap-1 md:gap-1.5 group"
      >
        <div
          className={`w-full rounded-md transition-all ${
            isSelected
              ? "bg-white shadow-md p-1"
              : "bg-white/50 shadow-sm hover:shadow-md hover:bg-white/70 p-1"
          }`}
        >
          <div
            className="w-full aspect-[5/3] md:aspect-[4/3] rounded relative overflow-hidden transition-all"
            style={{ background: gradient }}
            title={label}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        </div>
        <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors text-center w-full block truncate">
          {label}
        </span>
      </button>

      {onDelete && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          size="icon"
          variant="destructive"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full shadow-md z-10 cursor-pointer opacity-0 group-hover/theme:opacity-100 transition-opacity"
          title="Delete Theme"
        >
          <Trash2 className="size-[11px]" />
        </Button>
      )}
    </div>
  );
}
