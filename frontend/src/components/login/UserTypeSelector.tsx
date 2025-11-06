import { User, Building2 } from "lucide-react";

interface UserTypeSelectorProps {
  tipoUsuario: "empresa" | "postulante";
  onTipoChange: (tipo: "empresa" | "postulante") => void;
}

export function UserTypeSelector({ tipoUsuario, onTipoChange }: UserTypeSelectorProps) {
  return (
    <div className="flex gap-3 mb-6 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => onTipoChange("postulante")}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          tipoUsuario === "postulante"
            ? "bg-white text-orange-600 shadow-sm border border-orange-100"
            : "text-slate-600 hover:text-slate-800"
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
            ? "bg-white text-orange-600 shadow-sm border border-orange-100"
            : "text-slate-600 hover:text-slate-800"
        }`}
      >
        <Building2 size={20} />
        <span>Empresa</span>
      </button>
    </div>
  );
}
