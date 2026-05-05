'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: '⊞' },
    { name: 'Recetario (Costos)', href: '/dashboard/recipes', icon: '📝' },
    { name: 'Inventario Crítico', href: '/dashboard/inventory', icon: '📦' },
    { name: 'Punto de Venta POS', href: '/dashboard/pos', icon: '💳' },
    { name: 'Kanban', href: '/kanban', icon: '📋' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Messages', href: '/messages', icon: '✉️' },
  ];

  const categories = [
    { title: 'Apps', links: [] },
    { title: 'Charts', links: [] },
    { title: 'Bootstrap', links: [] },
    { title: 'Plugins', links: [] },
    { title: 'Widget', links: [] },
    { title: 'Forms', links: [] },
    { title: 'Table', links: [] },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#EFEFEF] hidden md:flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Vora.</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {/* Main List */}
        <div className="space-y-1 mb-6">
          {links.map((link) => {
            // Simplified active checking for Dashboard (root) and exact paths
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive 
                  ? 'bg-blue-50 text-[#2563EB]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className={`${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`}>
                  {link.icon}
                </div>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Fake Categories for purely visual Vora replication */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.title} className="flex justify-between items-center px-3 py-2 text-sm text-slate-500 font-medium cursor-pointer hover:text-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-slate-300">○</div>
                {cat.title}
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
