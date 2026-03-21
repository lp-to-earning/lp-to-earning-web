"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  show,
  message,
  type = "success",
  duration = 2000,
  onClose,
}: ToastProps) {
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
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md text-white px-6 py-3 rounded-2xl flex items-center gap-2 ghost-border font-medium text-sm ${styles[type]}`}
        >
          {icons[type]}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
