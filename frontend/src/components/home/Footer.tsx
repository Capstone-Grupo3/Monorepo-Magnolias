import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="surface-page dark:surface-card text-white py-16 border-t border-border-subtle">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 primary-bg rounded-sm flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">APT</h3>
            </div>
            <p className="text-gray-400 dark:text-gray-300">
              Reclutamiento inteligente para empresas modernas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-300 dark:hover:text-brand-400 transition-colors">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle text-center text-gray-400 dark:text-gray-500">
          <p>©2025 APT, todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}