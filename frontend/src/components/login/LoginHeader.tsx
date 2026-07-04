import Link from "next/link";
import { Briefcase } from "lucide-react";

interface LoginHeaderProps {
  isMobile?: boolean;
}

export function LoginHeader({ isMobile = false }: LoginHeaderProps) {
  if (isMobile) {
    return (
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="primary-bg p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary dark:text-white">APT</span>
        </Link>
        <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-secondary dark:text-gray-400">
          Accede a tu cuenta APT
        </p>
      </div>
    );
  }

  return (
    <div className="hidden lg:block mb-8">
      <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">
        Iniciar Sesión
      </h1>
      <p className="text-secondary dark:text-gray-400">
        Ingresa tus credenciales para continuar
      </p>
    </div>
  );
}