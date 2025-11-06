import Link from "next/link";
import { Briefcase, Target, Users, Zap, ArrowRight, CheckCircle, Sparkles, TrendingUp, Clock, Award, FileText, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                El software de <span className="text-orange-500">reclutamiento</span> preferido por los equipos de RRHH
              </h1>
              
              <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                Optimiza tu gestión de talento con el ATS impulsado por IA más elegido de LATAM
              </p>
              
              <Link
                href="/registro?tipo=empresa"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-orange-700 shadow-xl transition-all"
              >
                Agendar demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-blue-800/30 shadow-2xl">
                <div className="text-center mb-6">
                  <Briefcase className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Portal de Reclutamiento IA</h3>
                  <p className="text-blue-200">Análisis inteligente de candidatos en tiempo real</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-blue-100">Evaluación automática de CVs</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-blue-100">Ranking inteligente de postulantes</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-blue-100">Gestión centralizada de vacantes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <h3 className="text-center text-lg font-semibold text-slate-600 mb-8">
            ¡Publica, gestiona y contrata talento desde un solo lugar!
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">+1500</div>
              <div className="text-slate-600">Clientes en LATAM</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">13</div>
              <div className="text-slate-600">Países</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">19</div>
              <div className="text-slate-600">Portales integrados</div>
            </div>
          </div>
          <p className="text-center text-slate-600 mt-8 max-w-3xl mx-auto">
            APT es la plataforma líder en reclutamiento inteligente con IA, simplificando todo el proceso desde la publicación de vacantes hasta la contratación.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">
            Impacto en la eficiencia y resultados del equipo de Recursos Humanos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-6xl font-bold text-orange-500 mb-3">+40%</div>
              <div className="text-slate-700 text-lg font-medium">
                De mejora en la productividad del equipo de Recursos Humanos
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-6xl font-bold text-orange-500 mb-3">45%</div>
              <div className="text-slate-700 text-lg font-medium">
                De reducción en el tiempo de contratación
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-6xl font-bold text-orange-500 mb-3">25%</div>
              <div className="text-slate-700 text-lg font-medium">
                Más de conversión de postulantes a contratados
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Reclutamiento simplificado y efectivo
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Facilitamos el proceso de reclutamiento desde la publicación de vacantes hasta la contratación del candidato. 
              El enfoque se encuentra en la detección y selección de potenciales talentos de manera rápida y eficiente.
            </p>
          </div>
          
          <div className="grid gap-12 lg:gap-16">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                  Experiencia del Postulante
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Enfoque en la experiencia del postulante
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Permitimos a los candidatos postularse de manera rápida y sencilla con un formulario totalmente 
                  personalizable, para lograr una experiencia positiva desde el primer contacto con la empresa.
                </p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
                <FileText className="w-24 h-24 text-orange-500 mx-auto" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                  Gestión Centralizada
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Gestión de talento humano centralizada
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Esto abarca desde la publicación de vacantes hasta la contratación, la plataforma ofrece 
                  herramientas integradas que facilitan este proceso, optimizando así lo respectivo a recursos humanos.
                </p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
                <BarChart3 className="w-24 h-24 text-orange-500 mx-auto" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                  Colaboración Integral
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Colaboración integral en la selección
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Desde el reclutador hasta los equipos de recursos humanos y gerentes forman parte de este proceso. 
                  La plataforma ofrece funcionalidades que permiten una comunicación fluida y la toma de decisiones 
                  de forma colaborativa, asegurando así una selección más efectiva de postulantes.
                </p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
                <Users className="w-24 h-24 text-orange-500 mx-auto" />
              </div>
            </div>

            {/* Feature 4 - IA Highlight */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-12">
              <div className="flex-1">
                <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                  🤖 Inteligencia Artificial
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  IA en el proceso de reclutamiento y selección
                </h3>
                <p className="text-blue-200 text-lg leading-relaxed mb-6">
                  Contamos con 3 módulos que trabajan con Inteligencia Artificial para el proceso de reclutamiento y selección:
                </p>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    <span>Generación de descripción y preguntas de vacante.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    <span>Análisis automático de CVs y respuestas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    <span>Destaque de postulantes recomendados con ranking inteligente.</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-slate-800 rounded-2xl p-12 border border-blue-800/30">
                  <Sparkles className="w-24 h-24 text-orange-500 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="como-funciona" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Tu proceso de selección en 3 simples pasos
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Publica tu Vacante</h3>
              <p className="text-slate-600 leading-relaxed">
                Describe el puesto y define las preguntas clave que la IA usará para filtrar a los candidatos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Recibe Postulaciones</h3>
              <p className="text-slate-600 leading-relaxed">
                Los candidatos aplican y responden tus preguntas. Nuestra IA comienza a analizar cada perfil en tiempo real.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Selecciona al Mejor</h3>
              <p className="text-slate-600 leading-relaxed">
                Accede al ranking de candidatos, revisa los perfiles mejor calificados y contacta al talento ideal para tu empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="precios" className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="mb-6 text-5xl font-bold text-white">
            ¿Listo para revolucionar tu contratación?
          </h2>
          <p className="mb-10 text-xl text-blue-200 max-w-2xl mx-auto">
            Únete a las empresas que ya confían en la IA para construir equipos de alto rendimiento. Empieza hoy mismo tu MVP.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/registro?tipo=empresa"
              className="group rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-4 text-lg font-bold text-white hover:from-orange-600 hover:to-orange-700 shadow-2xl transition-all flex items-center gap-2"
            >
              Crear mi cuenta ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-400" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-400" />
              <span>Configuración en minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-400" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
            Preguntas frecuentes
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
                ¿Qué es un software de recursos humanos con IA?
              </summary>
              <p className="mt-4 text-slate-600">
                Es una plataforma que utiliza inteligencia artificial para automatizar y optimizar procesos de reclutamiento, 
                desde el análisis de CVs hasta la selección de candidatos ideales.
              </p>
            </details>

            <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
                ¿Cuáles son las principales funciones de APT?
              </summary>
              <p className="mt-4 text-slate-600">
                APT ofrece análisis automático de CVs, ranking inteligente de candidatos, gestión centralizada de vacantes, 
                publicación en múltiples portales, y evaluación de respuestas con IA.
              </p>
            </details>

            <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
                ¿Cómo puede beneficiar a mi empresa un software de reclutamiento con IA?
              </summary>
              <p className="mt-4 text-slate-600">
                Reduce hasta un 45% el tiempo de contratación, mejora en un 40% la productividad del equipo de RRHH, 
                y aumenta un 25% la conversión de postulantes a contratados.
              </p>
            </details>

            <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
                ¿Cómo puede un ATS con IA facilitar el proceso de reclutamiento?
              </summary>
              <p className="mt-4 text-slate-600">
                La IA analiza automáticamente cada CV, evalúa respuestas de candidatos, genera rankings basados en compatibilidad, 
                y destaca a los postulantes más adecuados, ahorrando horas de revisión manual.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">APT</span>
              </div>
              <p className="text-blue-200 text-sm">
                Reclutamiento inteligente para empresas modernas.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="#caracteristicas" className="hover:text-orange-400 transition-colors">Características</Link></li>
                <li><Link href="#como-funciona" className="hover:text-orange-400 transition-colors">Cómo funciona</Link></li>
                <li><Link href="#precios" className="hover:text-orange-400 transition-colors">Precios</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Sobre nosotros</Link></li>
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="/privacidad" className="hover:text-orange-400 transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-orange-400 transition-colors">Términos de Servicio</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800/30 pt-8 text-center">
            <p className="text-blue-200 text-sm">
              ©2025 APT, todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Test PR check workflow - 2025-11-06 14:27:51
