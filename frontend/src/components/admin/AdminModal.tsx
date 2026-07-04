"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  onSubmit?: () => void | Promise<void>;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
  onSubmit,
  loading = false,
  submitText = "Guardar",
  cancelText = "Cancelar",
}: AdminModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `admin-modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit();
    }
  };

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
              className={`relative surface-card dark:surface-card rounded-xl shadow-2xl w-full ${sizeClasses[size]}`}
            >
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                  <h3 id={titleId} className="text-lg font-semibold text-primary dark:text-white">{title}</h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-secondary dark:hover:text-gray-300 transition-colors p-1 hover:bg-surface-muted dark:hover:bg-surface-hover rounded-lg"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {children}
                </div>

                {/* Footer */}
                {footer ? (
                  <div className="px-6 py-4 border-t border-border-subtle surface-muted dark:surface-muted rounded-b-xl">
                    {footer}
                  </div>
                ) : onSubmit ? (
                  <div className="px-6 py-4 border-t border-border-subtle surface-muted dark:surface-muted rounded-b-xl flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 text-secondary dark:text-gray-300 surface-muted hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                    >
                      {cancelText}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitText}
                    </button>
                  </div>
                ) : null}
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Componente auxiliar para el formulario dentro del modal
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-secondary dark:text-gray-300">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

// Botones estándar para footer
interface ModalFooterButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  submitVariant?: "primary" | "danger";
}

export function ModalFooterButtons({
  onCancel,
  onSubmit,
  submitText = "Guardar",
  cancelText = "Cancelar",
  loading = false,
  disabled = false,
  submitVariant = "primary",
}: ModalFooterButtonsProps) {
  const submitStyles = {
    primary: "primary-bg hover:primary-bg-hover focus:ring-primary",
    danger: "error-bg hover:opacity-90 focus:ring-error",
  };

  return (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-secondary dark:text-gray-300 surface-card dark:surface-card border border-border-default rounded-lg hover:bg-surface-muted dark:hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || disabled}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 ${submitStyles[submitVariant]}`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitText}
      </button>
    </div>
  );
}