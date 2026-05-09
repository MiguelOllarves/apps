'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  const fetchCustomers = async () => {
    if (!tenantId || !session) return;
    try {
      const res = await fetch('http://10.100.5.199:4000/customers', {
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCustomers(await res.json());
        setError(null);
      } else if (res.status === 401) {
        setError('Sesión expirada. Por favor, re-inicia sesión.');
      } else {
        setError('Servidor no disponible');
      }
    } catch (e) {
      console.error('Error fetching customers', e);
      setError('Servidor no disponible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCustomers();
    }
  }, [tenantId, session]);

  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    setMetrics(null);
    try {
      const res = await fetch(`http://10.100.5.199:4000/customers/${cust.id}/metrics`, {
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMetrics(await res.json());
    } catch (e) {
      console.error('Error fetching metrics', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://10.100.5.199:4000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', notes: '' });
        fetchCustomers();
      }
    } catch (e) {
      console.error('Error creating customer', e);
    }
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-140px)] animate-in fade-in duration-500">

      {/* Left side: List and Search */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Clientes</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">CRM • Programa de Fidelidad</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <span className="text-xl">+</span> Nuevo Cliente
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Nombre del Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contacto</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Desde</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-300 animate-pulse tracking-widest uppercase">Cargando base de datos...</td></tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-red-500">
                        <span className="text-4xl text-red-300 animate-pulse">📡</span>
                        <p className="font-black uppercase tracking-[0.2em] text-xs">{error}</p>
                        <button
                          onClick={() => { setLoading(true); fetchCustomers(); }}
                          className="px-6 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          Reintentar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center flex flex-col items-center gap-4">
                      <span className="text-5xl">👥</span>
                      <p className="font-bold text-slate-400 uppercase tracking-widest">No hay clientes registrados aún</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className={`group hover:bg-blue-50/30 cursor-pointer transition-colors ${selectedCustomer?.id === cust.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-700">{cust.name}</div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{cust.role}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-slate-500">{cust.phone || 'No registrado'}</div>
                        <div className="text-[10px] text-slate-400">{cust.email}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-400">{new Date(cust.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right side: Detail View */}
      <div className="w-96 flex flex-col gap-6">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
          {selectedCustomer ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-[1.5rem] flex items-center justify-center text-2xl font-black">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Compras</p>
                  <p className="text-xl font-black text-[#2563EB]">{metrics?.totalOrders || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total</p>
                  <p className="text-xl font-black text-emerald-500">${metrics?.totalSpent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span>📝</span> Notas y Preferencias
                </h4>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-sm text-slate-600 font-medium">
                  {selectedCustomer.notes || 'Sin preferencias registradas.'}
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historial Reciente</h4>
                <div className="overflow-y-auto space-y-3 pr-2">
                  {metrics?.history?.length > 0 ? metrics.history.map((order: any) => (
                    <div key={order.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center transition-transform hover:scale-[1.02]">
                      <div>
                        <div className="text-xs font-bold text-slate-700">Orden #{order.id.slice(-4).toUpperCase()}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-black text-slate-800">${order.totalAmount.toFixed(2)}</div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">Sin historial aún</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <svg className="w-20 h-20 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Selecciona un cliente para ver detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Cliente</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alta en Programa de Fidelidad</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">✕</button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Nombre Completo*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Teléfono</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                      placeholder="+58 412..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Notas y Preferencias</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 h-32 resize-none"
                    placeholder="Ej. Alérgico al maní, prefiere mesa exterior..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
