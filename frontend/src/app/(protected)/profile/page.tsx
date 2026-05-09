'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: (session as any)?.user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(session?.user?.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('http://10.100.5.199:4000/uploads/image', {
        method: 'POST',
        body,
      });
      if (res.ok) {
        const data = await res.json();
        const newUrl = `http://10.100.5.199:4000${data.url}`;
        setAvatarUrl(newUrl);
        // alert('Avatar subido con éxito');
      }
    } catch (err) {
      console.error('Error uploading avatar', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Perfil actualizado con éxito');
    setIsEditing(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) return alert('Contraseñas no coinciden');
    alert('Contraseña actualizada');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Command Center Summary */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="mt-8 relative inline-block">
              <div className="w-32 h-32 bg-slate-100 border-4 border-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl mx-auto overflow-hidden">
                {previewUrl || avatarUrl ? (
                  <img src={(previewUrl || avatarUrl) as string} alt="Avatar" className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : 'opacity-100'}`} />
                ) : (
                  <span className="font-black text-blue-600">{session?.user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white p-2 rounded-xl shadow-lg border border-slate-100 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-[2.5rem] animate-pulse text-xs font-black text-blue-600">...</div>}
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{session?.user?.name}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{(session as any)?.role || 'Administrador'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-black text-emerald-500">Activo</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Tenant</p>
                <p className="text-xs font-black text-slate-800">{(session as any)?.tenantId?.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Seguridad (Logs)
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((log) => (
                <div key={log} className="flex items-center justify-between text-xs pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-700">Inicio de sesión</p>
                    <p className="text-slate-400">190.42.10.{log}2 • Caracas, VE</p>
                  </div>
                  <span className="text-slate-300 font-bold">Hoy</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information Forms */}
        <div className="flex-1 flex flex-col gap-8">
          
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Información de Cuenta</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-black uppercase text-blue-600 tracking-widest"
              >
                {isEditing ? 'Cancelar' : 'Editar Datos'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 disabled:opacity-50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</label>
                <input 
                  type="email" 
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-300 focus:outline-none disabled:opacity-50"
                  readOnly
                />
              </div>
              {isEditing && (
                <div className="md:col-span-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">
                    Guardar Cambios
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-10">Cambio de Contraseña</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={passwordData.new}
                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    value={passwordData.confirm}
                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button className="bg-slate-900 hover:bg-black text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                Actualizar Seguridad
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
