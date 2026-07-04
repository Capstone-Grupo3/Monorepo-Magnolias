"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, CheckCircle, Info, Loader2 } from "lucide-react";

type ConfirmType = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  loading?: boolean;
}

const typeConfig: Record<ConfirmType, { icon: React.ComponentType<{ size?: number }>; bg: string; border: string; text: string; btnBg: string; btnHover: string }> = {
  danger: {
    icon: XCircle,
    bg: "error-soft",
    border: "border-error",
    text: "error",
    btnBg: "error-bg",
    btnHover: "opacity-90",
  },
  warning: {
    icon: AlertTriangle,
    bg: "warning-soft",
    border: "border-warning",
    text: "warning",
    btnBg: "warning-bg",
    btnHover: "opacity-90",
  },
  info: {
    icon: Info,
    bg: "primary-soft",
    border: "border-primary",
    text: "primary",
    btnBg: "primary-bg",
    btnHover: "primary-bg-hover",
  },
  success: {
    icon: CheckCircle,
    bg: "success-soft",
    border: "border-success",
    text: "success",
    btnBg: "success-bg",
    btnHover: "opacity-90",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  loading = false,
}: ConfirmModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `confirm-modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 surface-overlay/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="relative surface-card dark:surface-card rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 text-center">
                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.bg} ${config.border} ${config.text}`}>
                  <Icon size={32} />
                </div>

                {/* Title */}
                <h3 id={titleId} className="text-lg font-semibold text-primary dark:text-white mb-2">{title}</h3>

                {/* Message */}
                <p className="text-secondary dark:text-gray-300 mb-6">{message}</p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-secondary dark:text-gray-300 surface-card border border-border-default rounded-lg hover:bg-surface-muted dark:hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 ${config.btnBg} hover:${config.btnHover} transition-colors`}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}