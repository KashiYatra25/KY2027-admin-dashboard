"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function DataTableSearch({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
}: DataTableSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-9 bg-muted/30 border-border/50 focus:bg-background transition-colors"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
