"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error" | "info" | "loading";
  /** 0이면 자동으로 닫지 않음(저장 중 등) */
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  show,
  message,
  type = "success",
  duration: durationProp,
  onClose,
}: ToastProps) {
  const duration =
    durationProp !== undefined
      ? durationProp
      : type === "loading"
        ? 0
        : 2000;

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const styles = {
    success: "bg-emerald-600/90 shadow-[0_10px_40px_rgba(16,185,129,0.3)]",
    error: "bg-red-600/90 shadow-[0_10px_40px_rgba(239,68,68,0.3)]",
    info: "bg-indigo-600/90 shadow-[0_10px_40px_rgba(79,70,229,0.3)]",
    loading: "bg-indigo-600/90 shadow-[0_10px_40px_rgba(79,70,229,0.35)]",
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    loading: <Loader2 className="animate-spin" size={18} aria-hidden />,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`ghost-border fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium text-white backdrop-blur-md ${styles[type]}`}
        >
          {icons[type]}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
