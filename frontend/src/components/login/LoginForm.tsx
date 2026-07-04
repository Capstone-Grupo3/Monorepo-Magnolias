import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  loading: boolean;
  error: string;
  authError: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  email,
  password,
  showPassword,
  rememberMe,
  loading,
  error,
  authError,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onRememberMeChange,
  onSubmit
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Mensaje de error */}
      {(error || authError) && (
        <div className="error-soft rounded-xl px-4 py-3 text-sm flex items-start gap-2 border border-error">
          <span className="font-bold">⚠</span>
          <span>{error || authError}</span>
        </div>
      )}

      {/* Campo Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-secondary mb-2"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-muted" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="w-full pl-11 pr-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-surface-card"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-secondary mb-2"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-muted" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="w-full pl-11 pr-12 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-surface-card"
            placeholder="••••••••"
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
      </div>

      {/* Recordarme y Olvidé contraseña */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-4 h-4 primary border-border-default rounded-sm focus:ring-3 focus:ring-primary/30"
          />
          <span className="text-sm text-secondary group-hover:text-primary dark:group-hover:text-brand-300 transition-colors">
            Recordarme
          </span>
        </label>
        <Link
          href="/recuperar-password"
          className="text-sm primary hover:primary-hover font-medium hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Botón de inicio de sesión */}
      <button
        type="submit"
        disabled={loading}
        className="w-full primary-bg text-white py-3.5 rounded-lg font-semibold hover:primary-bg-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Iniciando sesión...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Iniciar Sesión Sesión
            <ArrowRight className="w-5 h-5" />
          </span>
        )}
      </button>
    </form>
  );
}