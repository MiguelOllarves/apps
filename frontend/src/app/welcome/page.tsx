'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function WelcomeLandingPage() {
  useEffect(() => {
    // Solicitar permisos de notificación para operadores SaaS
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-7xl px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">ControlTotal.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 font-[family-name:var(--font-geist-sans)]">
          <a href="#features" className="hover:text-[#2563EB] transition-colors">Características</a>
          <a href="#pricing" className="hover:text-[#2563EB] transition-colors">Precios</a>
          <a href="#" className="hover:text-[#2563EB] transition-colors">Soporte</a>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-[#2563EB] transition-colors font-[family-name:var(--font-geist-sans)]">Iniciar Sesión</Link>
          <Link href="/register" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-lg shadow-blue-500/30 font-[family-name:var(--font-geist-sans)]">Probar Gratis</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full relative overflow-hidden flex flex-col items-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-7xl w-full px-6 lg:px-8 pt-24 pb-32 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          {/* Copy */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] font-bold text-xs uppercase tracking-widest mb-6 shadow-sm font-[family-name:var(--font-geist-sans)]">
              SaaS para Gastronomía de Alto Nivel
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 font-[family-name:var(--font-geist-sans)]">
              El control absoluto de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#4338CA]">restaurante</span> desde la nube.
            </h1>
            <p className="text-lg text-slate-500 mb-10 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 font-[family-name:var(--font-geist-sans)]">
              ControlTotal centraliza tu inventario, recetario y ventas en una plataforma inteligente. Calcula tus márgenes reales en USD y VES al instante y elimina las mermas ocultas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/30 text-lg flex justify-center items-center gap-2 group font-[family-name:var(--font-geist-sans)]">
                Empezar Ahora
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-lg flex justify-center items-center shadow-sm font-[family-name:var(--font-geist-sans)]">
                Ver Demo
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 font-[family-name:var(--font-geist-sans)]">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-800">500+</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Restaurantes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-800">BCV</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tasa Sincronizada</p>
              </div>
            </div>
          </div>

          {/* Phone/Dashboard Graphic Mockup */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="relative rounded-[2rem] bg-slate-900 shadow-[0_30px_100px_rgba(37,99,235,0.2)] border-8 border-slate-900 border-b-0 overflow-hidden aspect-[4/3] rotate-1">
              <div className="w-full h-full bg-slate-50 flex">
                <div className="w-1/4 h-full bg-white border-r border-slate-200"></div>
                <div className="w-3/4 h-full flex flex-col p-6">
                  <div className="h-4 w-full bg-slate-200 rounded-full mb-6"></div>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-white h-24 rounded-2xl border border-slate-100 p-4">
                      <div className="w-full h-8 bg-blue-100 rounded-lg"></div>
                    </div>
                    <div className="flex-1 bg-white h-24 rounded-2xl border border-slate-100 p-4">
                      <div className="w-3/4 h-8 bg-emerald-100 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="w-full flex-1 bg-white border border-slate-100 rounded-2xl p-4 flex items-end justify-between">
                    <div className="w-[10%] bg-blue-200 h-1/2 rounded-t-lg"></div>
                    <div className="w-[10%] bg-blue-500 h-3/4 rounded-t-lg"></div>
                    <div className="w-[10%] bg-blue-400 h-full rounded-t-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -left-12 bottom-12 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 w-72 transform -rotate-1 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex justify-center items-center text-emerald-600 font-bold">✓</div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Notificación BCV</p>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-tight">Tasa actualizada: 489.55 VES. Costos ajustados automáticamente.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="w-full bg-white py-32 border-t border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-20 font-[family-name:var(--font-geist-sans)]">Todo lo que necesitas para tu ERP Gastronómico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 font-[family-name:var(--font-geist-sans)]">

            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">📉</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Reducción de Mermas</h3>
              <p className="text-slate-500 font-medium px-4">Detecta fugas de dinero en tu cocina con el cálculo automático de merma por insumo y por receta.</p>
            </div>

            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">💵</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Multi-Divisa (USD/VES)</h3>
              <p className="text-slate-500 font-medium px-4">Costea en dólares y vende en bolívares. El sistema recalcula tus precios según la tasa del día automáticamente.</p>
            </div>

            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Auditoría en WhatsApp</h3>
              <p className="text-slate-500 font-medium px-4">Recibe tu cierre de caja y reporte de stock crítico directamente en tu chat personal al finalizar el día.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 py-16 text-center">
        <div className="mb-6 flex justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        </div>
        <p className="text-sm font-bold text-slate-400 font-[family-name:var(--font-geist-sans)]">© 2026 ControlTotal Software S.A. Hecho con ❤️ para Latinoamérica.</p>
      </footer>
    </div>
  );
}
