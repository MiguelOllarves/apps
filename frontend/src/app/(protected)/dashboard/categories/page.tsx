'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'RAW_MATERIAL' as 'RAW_MATERIAL' | 'MENU_ITEM'
  });

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  const fetchCategories = async () => {
    if (!tenantId) return;
    try {
      const res = await fetch('http://127.0.0.1:4000/categories', {
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error('Error fetching categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
       console.error('[Categories] Cannot save: No tenantId');
       return;
    }

    try {
      console.log('[Categories] Creating category:', formData);
      const res = await fetch('http://127.0.0.1:4000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        console.log('[Categories] Successfully created');
        setIsModalOpen(false);
        setFormData({ name: '', type: 'RAW_MATERIAL' });
        fetchCategories();
      } else {
        const errData = await res.json();
        console.error('[Categories] Save failed:', errData);
      }
    } catch (err) {
      console.error('Error creating category', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta categoría?')) return;
    try {
      await fetch(`http://127.0.0.1:4000/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category', err);
    }
  };

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Gestión de Categorías</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Organización de Insumos y Menú • ControlTotal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
        >
          <span className="mr-2">📂</span> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <th className="p-6 pl-10">Nombre de Categoría</th>
                <th className="p-6">Tipo</th>
                <th className="p-6 text-right pr-10">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={3} className="p-10 text-center animate-pulse text-slate-300 font-bold">Cargando categorías...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={3} className="p-10 text-center text-slate-400">No hay categorías registradas.</td></tr>
              ) : (
                categories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 pl-10 font-black text-slate-800 text-lg">{cat.name}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cat.type === 'RAW_MATERIAL' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {cat.type === 'RAW_MATERIAL' ? 'Insumo' : 'Plato / Menú'}
                      </span>
                    </td>
                    <td className="p-6 pr-10 text-right">
                      <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 font-bold transition-colors">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Categoría</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre de la Categoría*</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 transition-all"
                  placeholder="Ej: Bebidas, Carnes, Postres..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipo de Categoría*</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 transition-all appearance-none"
                >
                  <option value="RAW_MATERIAL">Insumos (Para Inventario)</option>
                  <option value="MENU_ITEM">Platos / Menú (Para POS)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                Crear Categoría
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
