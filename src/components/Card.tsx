import React from "react";

interface CardProps {
  title: React.ReactNode;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, rightElement, children, className = "" }: CardProps) {
  return (
    <div className={`glass ghost-border p-6 rounded-3xl flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
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
    <div className="bg-muted/40 p-4 rounded-2xl flex items-center justify-between border border-border/50">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 ${iconBgClass} rounded-xl flex items-center justify-center ${iconColorClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-white font-bold text-sm mt-0.5">{value}</p>
        </div>
      </div>
      {rightElement}
    </div>
  );
}
