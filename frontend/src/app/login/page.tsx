'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@controltotal.com');
  const [password, setPassword] = useState('hashed_password_123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (res?.error) {
        setError('Credenciales inválidas. Por favor verifique.');
        setLoading(false);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-[family-name:var(--font-geist-sans)] p-6">
      <div className="w-full max-w-[420px]">
        {/* Brand Banner */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-xl shadow-blue-500/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight underline decoration-[#2563EB] decoration-4 underline-offset-4">ControlTotal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Iniciar Sesión 👋</h2>
            <p className="text-sm font-medium text-slate-500">Gestiona tu negocio con ControlTotal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Correo Electrónico*
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder:text-slate-300 shadow-sm"
                placeholder="usuario@controltotal.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contraseña*</label>
                <a href="#" className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors">¿Olvidaste tu clave?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600">Mantenme conectado</label>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-bold shadow-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar al Sistema
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-500">
              ¿Eres nuevo? <a href="/register" className="font-bold text-[#2563EB] hover:underline">Registrar mi Negocio</a>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-widest">
          © 2026 ControlTotal Software S.A.
        </p>
      </div>
    </div>
  );
}
