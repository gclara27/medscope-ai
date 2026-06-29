import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { SUPPORT_CENTER_COPY } from "@/lib/supportKb";
import { cn } from "@/lib/utils";

interface SupportKbSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Client-side knowledge base search (T-X05-03, UC-064). */
export function SupportKbSearch({ value, onChange, className }: SupportKbSearchProps) {
  const inputId = useId();

  return (
    <div className={cn("relative max-w-md", className)}>
      <label htmlFor={inputId} className="sr-only">
        Search knowledge base
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden
      />
      <Input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={SUPPORT_CENTER_COPY.searchPlaceholder}
        className="rounded-full border-outline-variant bg-surface-bright pl-9"
        autoComplete="off"
      />
    </div>
  );
}
