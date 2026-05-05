'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [tenantName, setTenantName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://127.0.0.1:4000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantName, userName, email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Error registrando su establecimiento');
      }
    } catch (err) {
      setError('Error critico de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-[family-name:var(--font-geist-sans)] p-6">
      <div className="w-full max-w-[480px]">
        {/* Brand Banner */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-xl shadow-blue-500/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">ControlTotal</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden relative">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Crear Negocio 🚀</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">SaaS de Gestión Gastronómica</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">
                Establecimiento / Restaurante*
              </label>
              <input 
                type="text" 
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-300"
                placeholder="Ej. La Mansión del Gourmet"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">
                  Tu Nombre*
                </label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-300"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">
                  Correo del Admin*
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-300"
                  placeholder="admin@tu-local.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Contraseña Maestra*</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs text-center font-bold shadow-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/30 flex justify-center items-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <span className="flex items-center gap-2">
                  Crear Mi Tenant Ahora
                   <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-sm font-bold text-slate-400">
               ¿Ya gestionas con nosotros? <Link href="/login" className="text-[#2563EB] hover:underline ml-1">Ingresa aquí</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-black text-slate-300 mt-10 uppercase tracking-widest">
           Power by ControlTotal SaaS Engine v1.0
        </p>
      </div>
    </div>
  );
}
