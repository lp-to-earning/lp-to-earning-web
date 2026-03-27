import React from "react";

interface CardProps {
  title: React.ReactNode;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  title,
  rightElement,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`glass ghost-border flex flex-col rounded-3xl p-6 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase">
          {title}
        </div>
        {rightElement}
      </div>
      {children}
    </div>
  );
}

interface CardContentProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  rightElement?: React.ReactNode;
}

export function CardContent({
  icon: Icon,
  label,
  value,
  iconBgClass = "bg-muted",
  iconColorClass = "text-muted-foreground",
  rightElement,
}: CardContentProps) {
  return (
    <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-2xl border p-4">
      <div className="flex items-center gap-4">
        <div
          className={`h-10 w-10 ${iconBgClass} flex items-center justify-center rounded-xl ${iconColorClass}`}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-foreground mt-0.5 text-sm font-bold">{value}</p>
        </div>
      </div>
      {rightElement}
    </div>
  );
}
