import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { validarRut, formatearRutInput, obtenerMensajeErrorRut } from "@/lib/rut-validator";

interface EmpresaFormData {
  rut: string;
  nombre: string;
  correo: string;
  contrasena: string;
  descripcion: string;
  logoUrl: string;
}

interface EmpresaFormProps {
  formData: EmpresaFormData;
  showPassword: boolean;
  loading: boolean;
  onFormChange: (data: EmpresaFormData) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpresaForm({
  formData,
  showPassword,
  loading,
  onFormChange,
  onShowPasswordToggle,
  onSubmit
}: EmpresaFormProps) {
  const [rutTouched, setRutTouched] = useState(false);

  const rutError = useMemo(() => {
    if (rutTouched && formData.rut) {
      return obtenerMensajeErrorRut(formData.rut);
    }
    return "";
  }, [formData.rut, rutTouched]);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const rutFormateado = formatearRutInput(valor);
    onFormChange({ ...formData, rut: rutFormateado });
  };

  const handleRutBlur = () => {
    setRutTouched(true);
  };

  const isRutValid = formData.rut && validarRut(formData.rut);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          RUT de la Empresa <span className="text-error">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.rut}
          onChange={handleRutChange}
          onBlur={handleRutBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
            rutTouched && rutError
              ? "border-error"
              : isRutValid
              ? "border-success"
              : "border-border-default"
          }`}
          placeholder="76.123.456-7"
        />
        {rutTouched && rutError && (
          <p className="text-xs text-error mt-1">{rutError}</p>
        )}
        {isRutValid && (
          <p className="text-xs text-success mt-1">✓ RUT válido</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          Nombre de la Empresa <span className="text-error">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
          className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="Tech Solutions SpA"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          Email Corporativo <span className="text-error">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.correo}
          onChange={(e) => onFormChange({ ...formData, correo: e.target.value })}
          className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="contacto@empresa.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          Contraseña <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={formData.contrasena}
            onChange={(e) => onFormChange({ ...formData, contrasena: e.target.value })}
            className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-muted mt-1">La contraseña debe tener al menos 6 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          Descripción
        </label>
        <textarea
          rows={4}
          value={formData.descripcion}
          onChange={(e) => onFormChange({ ...formData, descripcion: e.target.value })}
          className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
          placeholder="Cuéntanos sobre tu empresa, sector, misión y valores..."
        />
        <p className="text-xs text-muted mt-1">Esta información será visible para los candidatos</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
          Logo URL (opcional)
        </label>
        <input
          type="url"
          value={formData.logoUrl}
          onChange={(e) => onFormChange({ ...formData, logoUrl: e.target.value })}
          className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="https://ejemplo.com/logo.png"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full primary-bg-hover text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Registrando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Crear Cuenta de Empresa
            <ArrowRight className="w-5 h-5" />
          </span>
        )}
      </button>
    </form>
  );
}