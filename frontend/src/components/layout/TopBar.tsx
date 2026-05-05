'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function TopBar({ user }: { user: any }) {
  return (
    <header className="h-20 bg-white border-b border-[#EFEFEF] px-6 lg:px-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10 sticky top-0">
      
      {/* Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-[#2563EB] transition-colors md:hidden">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <button className="text-[#2563EB] hidden md:block hover:bg-blue-50 p-2 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h8M4 18h16"></path></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Dashboard</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        
        {/* Search */}
        <div className="hidden lg:flex items-center relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search here..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 w-64 transition-all focus:w-72" 
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Email */}
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">6</span>
          </button>
          
          {/* Bell */}
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">4</span>
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="flex flex-col items-end hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Peter Parkur'}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all font-bold text-slate-500" onClick={() => signOut()}>
            {user?.name?.charAt(0) || 'P'}
          </div>
        </div>
      </div>
    </header>
  );
}
