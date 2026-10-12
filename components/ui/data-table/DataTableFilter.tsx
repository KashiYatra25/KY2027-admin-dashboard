"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  count?: number;
}

interface DataTableFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function DataTableFilter({
  title,
  options,
  selectedValues,
  onChange,
}: DataTableFilterProps) {
  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-border/50 bg-muted/30 hover:bg-muted/50"
        >
          <Filter className="h-4 w-4 mr-2" />
          {title}
          {selectedValues.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 px-1.5 text-xs bg-foreground/10"
            >
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{title}</span>
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleSelect(option.value)}
            className="gap-2"
          >
            {option.icon}
            <span className="flex-1">{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs text-muted-foreground">{option.count}</span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
