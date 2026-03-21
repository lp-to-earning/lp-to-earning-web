import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import React from "react";

export interface SortItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface SortButtonGroupProps {
  items: SortItem[];
  currentSort: string;
  currentOrder: string;
  onSortClick: (value: string) => void;
  activeColorClass?: string;
}

export default function SortButtonGroup({
  items,
  currentSort,
  currentOrder,
  onSortClick,
  activeColorClass = "bg-indigo-600",
}: SortButtonGroupProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => {
        const isActive = currentSort === item.value;
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSortClick(item.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isActive
                ? `${activeColorClass} text-white shadow-lg shadow-indigo-500/30`
                : "bg-muted/30 border border-border/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {Icon && <Icon size={14} />}
            <span>{item.label}</span>
            
            {isActive && item.value !== "default" && (
              currentOrder === "desc" ? (
                <ArrowDownNarrowWide size={14} />
              ) : (
                <ArrowUpNarrowWide size={14} />
              )
            )}
          </button>
        );
      })}
    </div>
  );
}
