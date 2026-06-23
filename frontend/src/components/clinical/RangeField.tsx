import { FieldError } from "@/components/clinical/FieldError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  error,
  onChange,
  className,
}: RangeFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="flex justify-between text-on-surface-variant">
        <span>{label}</span>
        <span className="font-mono text-sm font-semibold text-primary">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </Label>
      <Input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "h-2 cursor-pointer accent-primary",
          error && "border-error focus-visible:ring-error",
        )}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
