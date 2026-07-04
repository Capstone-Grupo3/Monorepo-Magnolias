import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center gap-2 px-4 py-2 text-white error-bg hover:opacity-90 rounded-lg transition-all shadow-xs"
    >
      <LogOut size={20} />
      Cerrar Sesión
    </button>
  );
}