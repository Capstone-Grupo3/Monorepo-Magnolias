import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="border-subtle surface-card/95 fixed w-full z-50 shadow-xs backdrop-blur-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="primary-bg p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary dark:text-white">APT</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="#caracteristicas" className="text-secondary hover:text-primary dark:hover:text-brand-300 font-medium transition-colors">
            Características
          </Link>
          <Link href="#como-funciona" className="text-secondary hover:text-primary dark:hover:text-brand-300 font-medium transition-colors">
            Cómo funciona
          </Link>
          <Link href="#precios" className="text-secondary hover:text-primary dark:hover:text-brand-300 font-medium transition-colors">
            Precios
          </Link>
          <Link href="/login" className="text-secondary hover:text-primary dark:hover:text-brand-300 font-medium transition-colors">
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="rounded-lg primary-bg-hover px-6 py-2.5 text-white font-semibold transition-all"
          >
            Agendar demo
          </Link>
        </div>
      </nav>
    </header>
  );
}