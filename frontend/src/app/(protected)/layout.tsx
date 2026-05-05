'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session, status } = useSession();
  const [isApiDown, setIsApiDown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      try {
        const res = await fetch('http://127.0.0.1:4000/dashboard/metrics', {
          headers: { 
            'x-tenant-id': (session as any).tenantId,
            'Authorization': `Bearer ${(session as any).accessToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingOrdersCount || 0);
        }
      } catch (e) {}
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('http://127.0.0.1:4000/auth/login', { method: 'OPTIONS' });
        setIsApiDown(!res.ok && res.status !== 405); // 405 is fine for OPTIONS
      } catch (e) {
        setIsApiDown(true);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);
  const user = session?.user;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const menuItems = [
    { name: 'Panel de Control', icon: '📊', path: '/' },
    { name: 'Inventario', icon: '📦', path: '/dashboard/inventory' },
    { name: 'Recetario', icon: '🍳', path: '/dashboard/recipes' },
    { name: 'Ventas (POS)', icon: '💰', path: '/dashboard/pos' },
    { name: 'Clientes', icon: '👥', path: '/dashboard/customers' },
    { name: 'Configuración', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-[family-name:var(--font-geist-sans)]">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-100 transition-all duration-300 flex flex-col z-40 fixed h-full xl:sticky xl:top-0`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 shrink-0">
             CT
          </div>
          {isSidebarOpen && <span className="text-xl font-black text-slate-800 tracking-tighter">ControlTotal</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                pathname === item.path 
                ? 'bg-blue-50 text-[#2563EB] shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
              {pathname === item.path && isSidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div>
              )}
            </Link>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="p-4 m-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA] mb-1">PLAN SAAS</p>
            <p className="text-sm font-bold mb-3">Enterprise Pro</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] w-3/4 h-full shadow-[0_0_8px_#2563EB]"></div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TopBar */}
        {isApiDown && (
          <div className="bg-red-600 text-white px-8 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-center animate-pulse z-50">
            ⚠️ ERR_CONNECTION_REFUSED - El sistema está en Modo Lectura (Servidor desconectado)
          </div>
        )}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#2563EB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Buscar en el sistema..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex min-w-[120px]">
               {mounted && session && (
                 <Link href={`/catalogo/${(session as any)?.tenantId}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95">
                   <span>🛍️</span> Ver Mi Tienda
                 </Link>
               )}
             </div>

             <Link href="/dashboard/pos" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:border-[#2563EB] transition-all relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 border-2 border-white text-white font-black text-[9px] flex items-center justify-center shadow-lg animate-bounce">
                    {pendingCount}
                  </div>
                )}
             </Link>
             
             <div className="relative" ref={profileRef}>
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-3 p-1.5 pl-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 active:scale-95"
               >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-800 leading-none">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-tighter">Administrador</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                    {(user?.name || 'A').charAt(0)}
                  </div>
               </button>

               {isProfileOpen && (
                 <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                       <p className="text-sm font-bold text-slate-800">{user?.name || 'Admin'}</p>
                       <p className="text-xs text-slate-400">{user?.email || 'admin@controltotal.com'}</p>
                    </div>
                   <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                     👤 Mi Perfil
                   </Link>
                   <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                     ⚙️ Configuración
                   </Link>
                   <div className="h-px bg-slate-50 my-1 mx-2"></div>
                   <button 
                     onClick={() => signOut()}
                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                   >
                     🚪 Cerrar Sesión
                   </button>
                 </div>
               )}
             </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
