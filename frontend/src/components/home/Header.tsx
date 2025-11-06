import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-gray-100 bg-white fixed w-full z-50 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">APT</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="#caracteristicas" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Características
          </Link>
          <Link href="#como-funciona" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Cómo funciona
          </Link>
          <Link href="#precios" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Precios
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Agendar demo
          </Link>
        </div>
      </nav>
    </header>
  );
}
