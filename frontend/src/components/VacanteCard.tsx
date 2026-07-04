import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { TipoContrato, Modalidad } from "@/types";
import {
  getTipoContratoLabel,
  getModalidadLabel,
  formatSalaryRange,
  formatDateShort,
} from "@/lib/formatters";

interface VacanteCardProps {
  id: number;
  titulo: string;
  descripcion: string;
  empresaNombre: string;
  ubicacion?: string;
  tipo_contrato: TipoContrato;
  modalidad: Modalidad;
  salario_min?: number;
  salario_max?: number;
  fecha_publicacion: string;
  estado: string;
  onClick?: () => void;
}

export default function VacanteCard({
  titulo,
  descripcion,
  empresaNombre,
  ubicacion,
  tipo_contrato,
  modalidad,
  salario_min,
  salario_max,
  fecha_publicacion,
  estado,
  onClick,
}: VacanteCardProps) {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const formatSalario = () => {
    if (!salario_min && !salario_max) return null;
    if (salario_min && salario_max) {
      return `$${salario_min.toLocaleString()} - $${salario_max.toLocaleString()}`;
    }
    if (salario_min) return `Desde $${salario_min.toLocaleString()}`;
    if (salario_max) return `Hasta $${salario_max.toLocaleString()}`;
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}
      role="button"
      tabIndex={0}
      className="surface-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer border border-border-subtle hover:border-primary"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-primary dark:text-white mb-1">{titulo}</h3>
          <p className="text-secondary font-medium">{empresaNombre}</p>
        </div>
        {estado === "ACTIVO" && (
          <span className="success-soft text-xs font-semibold px-3 py-1 rounded-full">
            Activo
          </span>
        )}
      </div>

      {/* Descripción */}
      <p className="text-secondary text-sm mb-4 line-clamp-2">{descripcion}</p>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {ubicacion && (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <MapPin size={16} className="text-primary" />
            <span>{ubicacion}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-secondary">
          <Briefcase size={16} className="text-primary" />
          <span>{getModalidadLabel(modalidad)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-secondary">
          <Clock size={16} className="text-primary" />
          <span>{getTipoContratoLabel(tipo_contrato)}</span>
        </div>

        {formatSalario() && (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <DollarSign size={16} className="text-primary" />
            <span>{formatSalario()}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
        <span className="text-xs text-muted">
          {formatFecha(fecha_publicacion)}
        </span>
        <button className="text-primary hover:text-primary-hover font-medium text-sm transition-colors">
          Ver detalles →
        </button>
      </div>
    </div>
  );
}
