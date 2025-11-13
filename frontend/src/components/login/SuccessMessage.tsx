import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  show: boolean;
}

export function SuccessMessage({ show }: SuccessMessageProps) {
  if (!show) return null;

  return (
    <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs">
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="font-medium">
        ¡Registro exitoso! Ahora puedes iniciar sesión
      </span>
    </div>
  );
}
