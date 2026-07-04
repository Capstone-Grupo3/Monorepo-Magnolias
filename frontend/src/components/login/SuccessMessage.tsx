import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  show: boolean;
}

export function SuccessMessage({ show }: SuccessMessageProps) {
  if (!show) return null;

  return (
    <div className="mb-6 success-soft rounded-xl px-4 py-3 flex items-center gap-3 shadow-xs border border-success">
      <CheckCircle className="w-5 h-5 shrink-0 success" />
      <span className="font-medium success-soft-text">
        ¡Registro exitoso! Ahora puedes iniciar sesión
      </span>
    </div>
  );
}