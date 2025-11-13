import { Eye, EyeOff, ArrowRight } from "lucide-react";

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
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          RUT de la Empresa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.rut}
          onChange={(e) => onFormChange({ ...formData, rut: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="76.123.456-7"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Nombre de la Empresa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="Tech Solutions SpA"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Email Corporativo <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.correo}
          onChange={(e) => onFormChange({ ...formData, correo: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="contacto@empresa.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Contraseña <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={formData.contrasena}
            onChange={(e) => onFormChange({ ...formData, contrasena: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Descripción
        </label>
        <textarea
          rows={4}
          value={formData.descripcion}
          onChange={(e) => onFormChange({ ...formData, descripcion: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
          placeholder="Cuéntanos sobre tu empresa, sector, misión y valores..."
        />
        <p className="text-xs text-gray-500 mt-1">Esta información será visible para los candidatos</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Logo URL (opcional)
        </label>
        <input
          type="url"
          value={formData.logoUrl}
          onChange={(e) => onFormChange({ ...formData, logoUrl: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="https://ejemplo.com/logo.png"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
