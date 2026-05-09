'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('7d');

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  useEffect(() => {
    if (session) {
      console.log('[Dashboard] Session detected:', {
        user: session.user?.email,
        tenantId,
        hasToken: !!token,
        tokenPrefix: token ? `${token.substring(0, 10)}...` : 'NONE'
      });
    }
  }, [session, tenantId, token]);

  const fetchMetrics = async (currentRange = range) => {
    if (!tenantId || !session || !token) {
      console.warn('[Dashboard] Skipping fetch: missing tenantId, session or token');
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';
      const res = await fetch(`${baseUrl}/dashboard/metrics?range=${currentRange}`, {
        headers: {
          'x-tenant-id': tenantId,
          'Authorization': `Bearer ${token}`
        },
      });
      if (res.ok) {
        setMetrics(await res.json());
        setError(null);
      } else if (res.status === 401) {
        setError('Sesión expirada. Por favor, re-inicia sesión.');
      } else {
        setError('Servidor no disponible');
      }
    } catch (e) {
      console.error('Error fetching dashboard metrics', e);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMetrics();
      const interval = setInterval(() => fetchMetrics(), 300000);
      return () => clearInterval(interval);
    }
  }, [tenantId, range, session]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    setLoading(true);
    fetchMetrics(newRange);
  };

  const handlePurge = async () => {
    if (!confirm('¿ESTÁS SEGURO? Esta acción borrará TODO el historial de ventas, insumos y recetas para empezar de cero. Esta acción es irreversible.')) return;

    try {
      const res = await fetch('http://10.100.5.199:4000/dashboard/purge', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Datos purgados con éxito. El sistema está ahora limpio.');
        fetchMetrics();
        window.location.reload();
      }
    } catch (e) {
      alert('Error al purgar los datos.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-500 pb-10">

      {/* Real-time Order Alert Badge */}
      {metrics?.pendingOrdersCount > 0 && (
        <div className="bg-blue-600/10 border border-blue-600/20 text-blue-600 px-6 py-4 rounded-[2rem] flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <span className="w-4 h-4 rounded-full bg-blue-600"></span>
            <p className="font-black uppercase tracking-[0.2em] text-xs">¡Tienes {metrics.pendingOrdersCount} {metrics.pendingOrdersCount === 1 ? 'nueva orden' : 'nuevas órdenes'} entrando!</p>
          </div>
          <Link href="/dashboard/pos" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Ver Órdenes</Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Bienvenido, {session?.user?.name || 'Admin'}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Panel de Control General • ControlTotal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePurge}
            className="text-[10px] font-black uppercase text-red-300 hover:text-red-500 transition-colors mr-4 tracking-widest"
          >
            Purgar Datos (Start Clean)
          </button>
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-sm font-bold text-slate-600">
            Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
          </div>
          <Link href="/dashboard/pos" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            Nueva Venta
          </Link>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:border-blue-100 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ventas de Hoy</p>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">
                ${loading ? '...' : (metrics?.daySales || 0).toFixed(2)}
              </h3>
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                +{metrics?.growthPercentage || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl group-hover:bg-[#2563EB] group-hover:text-white transition-all">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:border-emerald-100 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Utilidad Proyectada</p>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-emerald-500 leading-none mb-1">
                ${loading ? '...' : (metrics?.dayProfit || 0).toFixed(2)}
              </h3>
              <p className="text-xs font-bold text-slate-400">Margen neto del día</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              📈
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:border-red-100 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stock Crítico</p>
          <div className="flex items-end justify-between">
            <div>
              <h3 className={`text-2xl font-black leading-none mb-1 ${(metrics?.stockAlertsCount || 0) > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                {loading ? '...' : metrics?.stockAlertsCount || 0} Items
              </h3>
              <p className={`text-xs font-bold ${(metrics?.stockAlertsCount || 0) > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {(metrics?.stockAlertsCount || 0) > 0 ? 'Requiere compra urgente' : 'Todo bajo control'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${(metrics?.stockAlertsCount || 0) > 0
                ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                : 'bg-slate-50 text-slate-400'
              }`}>
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:border-slate-800 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Órdenes Hoy</p>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">
                {loading ? '...' : (metrics?.daySales / 15 || 0).toFixed(0)} {/* Simulación de tkt count si no viene explícito */}
              </h3>
              <p className="text-xs font-bold text-slate-400">Ticket promedio aprox.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
              🎫
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Sales Chart using Recharts */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Crecimiento Ventas</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tendencia Operacional</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              {['today', '7d', 'month', 'year'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {r === '7d' ? 'Semana' : r === 'today' ? 'Hoy' : r === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full min-h-[400px]">
            {error ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-red-500 bg-red-50/50 rounded-3xl border border-red-100 p-8">
                <span className="text-4xl text-red-300 animate-pulse">📡</span>
                <p className="font-black uppercase tracking-[0.2em] text-xs">{error}</p>
                <button
                  onClick={() => { setLoading(true); fetchMetrics(); }}
                  className="px-6 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  Reintentar Conexión
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={metrics?.salesTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'black' }}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 8, 8]} barSize={40}>
                    {(metrics?.salesTrend || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === (metrics?.salesTrend?.length || 0) - 1 ? '#2563EB' : '#DBEAFE'}
                        className="hover:fill-blue-600 transition-all cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Alerts Details */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h3 className="text-xl font-black text-slate-800 mb-6">Alertas de Stock</h3>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-xs font-black text-slate-300 uppercase">Cargando alertas...</div>
            ) : (metrics?.stockAlerts?.length > 0) ? metrics.stockAlerts.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                    ⚠️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{item.name}</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                      Stock: {item.currentStock} {item.unit} (Min: {item.minStockAlert})
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-xl">✔️</div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock Optimizado</p>
              </div>
            )}
          </div>

          <Link href="/dashboard/inventory" className="block w-full mt-8 py-3 rounded-xl border-2 border-dashed border-slate-100 text-xs font-bold text-center text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all">
            Gestionar Inventario Completo
          </Link>
        </div>

      </div>

    </div>
  );
}
