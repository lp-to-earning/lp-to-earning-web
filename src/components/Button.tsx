import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  isLoading,
  variant = "primary",
  icon,
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-50 font-bold cursor-pointer";

  const variants = {
    primary:
      "px-4 py-3.5 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/10",
    secondary:
      "px-6 py-3 bg-muted-100 text-muted-900 hover:bg-muted-200 shadow-sm",
    danger:
      "px-4 py-2 text-xs text-error-400 hover:bg-error-500/10 border border-error-500/20 shadow-none font-medium",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {children}
    </button>
  );
}
