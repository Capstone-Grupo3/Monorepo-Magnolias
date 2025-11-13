import { Eye, EyeOff, ArrowRight } from "lucide-react";

interface PostulanteFormData {
  rut: string;
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  linkedinUrl: string;
  experienciaAnios: number;
}

interface PostulanteFormProps {
  formData: PostulanteFormData;
  showPassword: boolean;
  loading: boolean;
  onFormChange: (data: PostulanteFormData) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PostulanteForm({
  formData,
  showPassword,
  loading,
  onFormChange,
  onShowPasswordToggle,
  onSubmit
}: PostulanteFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            RUT <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.rut}
            onChange={(e) => onFormChange({ ...formData, rut: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="12.345.678-9"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Juan Pérez González"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.correo}
            onChange={(e) => onFormChange({ ...formData, correo: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="juan@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => onFormChange({ ...formData, telefono: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="+56 9 1234 5678"
          />
        </div>
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
          Perfil LinkedIn
        </label>
        <input
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => onFormChange({ ...formData, linkedinUrl: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="https://linkedin.com/in/tu-perfil"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Años de Experiencia
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={formData.experienciaAnios}
          onChange={(e) => onFormChange({ ...formData, experienciaAnios: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="Ej: 3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Registrando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Crear Cuenta de Postulante
            <ArrowRight className="w-5 h-5" />
          </span>
        )}
      </button>
    </form>
  );
}
