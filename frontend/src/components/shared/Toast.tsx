"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// Tipos de toast
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook para usar el toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
}

// Configuración de estilos por tipo
const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
    titleColor: "text-green-800",
    messageColor: "text-green-600",
    progressColor: "bg-green-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-gradient-to-r from-red-50 to-rose-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    titleColor: "text-red-800",
    messageColor: "text-red-600",
    progressColor: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
    titleColor: "text-amber-800",
    messageColor: "text-amber-600",
    progressColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-blue-50 to-sky-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    messageColor: "text-blue-600",
    progressColor: "bg-blue-500",
  },
};

// Componente individual del Toast
function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: string) => void;
}) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 4000;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        w-full max-w-sm
        ${config.bgColor} ${config.borderColor}
        border rounded-xl shadow-lg
        backdrop-blur-sm
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className={`shrink-0 ${config.iconColor}`}>
            <Icon size={24} strokeWidth={2} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${config.titleColor}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm ${config.messageColor}`}>
                {toast.message}
              </p>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => onRemove(toast.id)}
            className={`
              shrink-0 p-1 rounded-lg
              ${config.messageColor} hover:bg-white/50
              transition-colors duration-200
            `}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${config.progressColor}`}
        onAnimationComplete={() => onRemove(toast.id)}
      />
    </motion.div>
  );
}

// Contenedor de toasts
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Provider del Toast
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "error", title, message, duration: 5000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "warning", title, message });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "info", title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, warning, info, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
