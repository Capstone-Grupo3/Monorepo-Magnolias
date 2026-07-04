import { User, Building2 } from "lucide-react";

interface UserTypeSelectorProps {
  tipoUsuario: "empresa" | "postulante";
  onTipoChange: (tipo: "empresa" | "postulante") => void;
}

export function UserTypeSelector({ tipoUsuario, onTipoChange }: UserTypeSelectorProps) {
  return (
    <div className="flex gap-3 mb-6 surface-muted p-1.5 rounded-lg border border-border-subtle">
      <button
        type="button"
        onClick={() => onTipoChange("postulante")}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          tipoUsuario === "postulante"
            ? "surface-card text-primary shadow-xs border border-primary-soft"
            : "text-secondary hover:text-primary dark:hover:text-brand-300"
        }`}
      >
        <User size={20} />
        <span>Postulante</span>
      </button>
      <button
        type="button"
        onClick={() => onTipoChange("empresa")}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          tipoUsuario === "empresa"
            ? "surface-card text-primary shadow-xs border border-primary-soft"
            : "text-secondary hover:text-primary dark:hover:text-brand-300"
        }`}
      >
        <Building2 size={20} />
        <span>Empresa</span>
      </button>
    </div>
  );
}