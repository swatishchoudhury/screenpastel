"use client";
import { Label } from "@/components/ui/label";
import { Slider as UI_Slider } from "@/components/ui/slider";

const Slider = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs">
      <Label className="text-muted-foreground">{label}</Label>
      <span className="text-muted-foreground">
        {value}
        {unit}
      </span>
    </div>
    <UI_Slider
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      min={min}
      max={max}
      step={step}
      className="w-full"
    />
  </div>
);

export default Slider;
