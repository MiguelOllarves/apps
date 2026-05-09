'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NumericInput } from '@/components/ui/NumericInput';

export default function InventoryPage() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: 'KG' as any,
    currentStock: 0,
    minStockAlert: 1,
    baseCost: 0,
    shrinkagePercentage: 0,
    categoryId: ''
  });

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  const fetchData = async () => {
    if (!tenantId || !session || !token) {
      console.warn('[Inventory] Skipping fetch: missing tenantId, session or token');
      return;
    }
    try {
      console.log('[Inventory] Fetching data for tenant:', tenantId, { hasToken: !!token });
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';
      const [matRes, catRes] = await Promise.all([
        fetch(`${baseUrl}/materials`, { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/categories`, { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } })
      ]);

      if (matRes.ok) {
        setMaterials(await matRes.json());
        setError(null);
      } else if (matRes.status === 401) {
        setError('Sesión expirada. Por favor, re-inicia sesión.');
      } else {
        setError('Servidor no disponible');
      }
      if (catRes.ok) {
        const allCats = await catRes.json();
        console.log('[Inventory] Categories fetched:', allCats);
        // We filter for RAW_MATERIAL categories on the client side to be safe
        const rawCats = allCats.filter((c: any) => c.type === 'RAW_MATERIAL');
        setCategories(rawCats);
      } else {
        console.error('[Inventory] Failed to fetch categories', catRes.status);
      }
    } catch (e) {
      console.error('Error cargando datos', e);
      setError('Servidor no disponible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [tenantId, session]);

  const handleEdit = (mat: any) => {
    setIsEditing(true);
    setEditingId(mat.id);
    setFormData({
      name: mat.name,
      unit: mat.unit,
      currentStock: mat.currentStock,
      minStockAlert: mat.minStockAlert,
      baseCost: mat.baseCost,
      shrinkagePercentage: mat.shrinkagePercentage,
      categoryId: mat.categoryId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este insumo?')) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';
      const res = await fetch(`${baseUrl}/materials/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error eliminando insumo', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(isEditing ? `${baseUrl}/materials/${editingId}` : `${baseUrl}/materials`, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          replacementCost: formData.baseCost,
          yieldPercentage: 100 - formData.shrinkagePercentage
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', unit: 'KG', currentStock: 0, minStockAlert: 1, baseCost: 0, shrinkagePercentage: 0, categoryId: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Error guardando insumo', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Inventario de Insumos</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Gestión de stock, mermas y auditoría • ControlTotal</p>
        </div>
        <button
          onClick={() => { setIsEditing(false); setFormData({ name: '', unit: 'KG', currentStock: 0, minStockAlert: 1, baseCost: 0, shrinkagePercentage: 0, categoryId: '' }); setIsModalOpen(true); }}
          className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 active:scale-95 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
          Agregar Nuevo Insumo
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <th className="p-6 pl-10">Materia Prima / Insumo</th>
                <th className="p-6">Existencia Actual</th>
                <th className="p-6">Costo (USD)</th>
                <th className="p-6">Merma Est.</th>
                <th className="p-6">Estatus</th>
                <th className="p-6 text-right pr-10">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Cargando base de datos operacional...</td></tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-red-500">
                      <span className="text-4xl text-red-300 animate-pulse">📡</span>
                      <p className="font-black uppercase tracking-[0.2em] text-xs">Servidor no disponible</p>
                      <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="px-6 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium italic">No se han registrado insumos.</td></tr>
              ) : (
                materials.map((mat: any) => {
                  const isCritical = mat.currentStock <= mat.minStockAlert;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6 pl-10">
                        <div className="font-black text-slate-800 text-base">{mat.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{mat.category?.name || 'Varios'}</div>
                      </td>
                      <td className="p-6">
                        <div className={`font-black text-lg ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                          {mat.currentStock} <span className="text-xs font-bold text-slate-400">{mat.unit}</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 text-xs">Min: {mat.minStockAlert}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-black text-slate-700">${mat.baseCost.toFixed(2)}</div>
                      </td>
                      <td className="p-6 font-black text-slate-500">{mat.shrinkagePercentage}%</td>
                      <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isCritical ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {isCritical ? 'Abastecer' : 'Stock OK'}
                        </span>
                      </td>
                      <td className="p-6 pr-10 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(mat)} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-600 transition-all" title="Editar">✏️</button>
                        <button onClick={() => handleDelete(mat.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-red-500 transition-all font-bold" title="Eliminar">✕</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
              <button onClick={() => { setIsModalOpen(false); setIsEditing(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 font-bold">Categoría*</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900"
                  required
                >
                  <option value="" className="text-slate-900">Seleccionar Categoría...</option>
                  {loading ? (
                    <option disabled className="text-slate-900">Cargando...</option>
                  ) : categories.length === 0 ? (
                    <option disabled className="text-slate-900">No hay categorías creadas</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="text-slate-900">
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 font-bold">Unidad*</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 appearance-none"
                  >
                    <optgroup label="Peso" className="text-slate-900 font-bold bg-slate-50">
                      <option value="G">Gramos (g)</option>
                      <option value="KG">Kilogramos (kg)</option>
                      <option value="LB">Libras (lb)</option>
                      <option value="OZ">Onzas (oz)</option>
                    </optgroup>
                    <optgroup label="Volumen" className="text-slate-900 font-bold bg-slate-50">
                      <option value="ML">Mililitros (ml)</option>
                      <option value="L">Litros (L)</option>
                      <option value="OZ_FL">Onzas Fl. (fl oz)</option>
                      <option value="GAL">Galones (gal)</option>
                    </optgroup>
                    <optgroup label="Unidades" className="text-slate-900 font-bold bg-slate-50">
                      <option value="UNIT">Unidad (und)</option>
                      <option value="PACK">Pack</option>
                      <option value="DOZEN">Docena</option>
                      <option value="BOX">Caja</option>
                    </optgroup>
                  </select>
                </div>
                <NumericInput
                  label="% Merma"
                  value={formData.shrinkagePercentage}
                  onValueChange={v => setFormData({ ...formData, shrinkagePercentage: Number(v.value) })}
                  suffix="%"
                  allowNegative={false}
                  max={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <NumericInput
                  label="Stock Inicial"
                  value={formData.currentStock}
                  onValueChange={v => setFormData({ ...formData, currentStock: Number(v.value) })}
                  allowNegative={false}
                />
                <NumericInput
                  label="Costo ($)"
                  value={formData.baseCost}
                  onValueChange={v => setFormData({ ...formData, baseCost: Number(v.value) })}
                  prefix="$"
                  decimalScale={2}
                  fixedDecimalScale={true}
                  allowNegative={false}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all">{isEditing ? 'Guardar Cambios' : 'Guardar Insumo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
