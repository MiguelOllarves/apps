'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('storefront');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tenantData, setTenantData] = useState({
    name: '',
    address: '',
    logo: '',
    bannerImage: '',
    primaryColor: '#2563EB',
    whatsapp: '',
    instagram: '',
    slug: ''
  });

  const tenantId = (session as any)?.tenantId;
  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (tenantId && token) {
      fetch('http://10.100.5.199:4000/tenants/settings', {
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setTenantData({
            name: data.name || '',
            address: data.address || '',
            logo: data.logo || '',
            bannerImage: data.bannerImage || '',
            primaryColor: data.primaryColor || '#2563EB',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            slug: data.slug || ''
          });
        })
        .catch(err => console.error('Error fetching settings', err));
    }
  }, [tenantId, token]);

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const tabs = [
    { id: 'storefront', name: 'Mi Tienda Online', icon: '🛍️' },
    { id: 'plan', name: 'Plan SaaS', icon: '💎' },
    { id: 'billing', name: 'Facturación', icon: '🧾' },
    { id: 'api', name: 'API & Integraciones', icon: '🔗' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') setPreviewLogo(reader.result as string);
      else setPreviewBanner(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (type === 'logo') setIsUploadingLogo(true);
    else setIsUploadingBanner(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = 'http://10.100.5.199:4000';
      const res = await fetch(`${baseUrl}/api/uploads/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setTenantData(prev => ({ ...prev, [type === 'logo' ? 'logo' : 'bannerImage']: data.url }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Upload failed:', errorData);
        alert(`❌ Error al subir la imagen: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('❌ Error de conexión al subir imagen');
    } finally {
      if (type === 'logo') setIsUploadingLogo(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!tenantId || !token) {
      alert('Error: No se encontró la sesión activa. Por favor, re-inicia sesión.');
      return;
    }

    setIsSaving(true);
    try {
      const baseUrl = 'http://10.100.5.199:4000';

      const res = await fetch(`${baseUrl}/tenants/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tenantData),
      });

      if (res.ok) {
        alert('✅ ¡Configuración guardada con éxito!');
      } else {
        const errData = await res.json();
        alert(`❌ Error al guardar: ${errData.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error saving settings', err);
      alert('❌ Error de conexión con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in duration-700">

      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Configuración Pro</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Control del Ecosistema SaaS y Auditoría • ControlTotal</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 h-full">

        {/* Navigation Tabs */}
        <div className="lg:w-72 flex lg:flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all text-left ${activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/5 border border-slate-100'
                : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/10 p-12 overflow-y-auto">

          {activeTab === 'plan' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">Tu Plan Actual</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ControlTotal Enterprise Unlimited</p>
                </div>
                <div className="bg-blue-50 text-blue-600 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest border border-blue-100">
                  Activo
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Próximo Vencimiento</p>
                  <p className="text-2xl font-black text-slate-800">24 Mayo, 2026</p>
                  <p className="text-xs font-bold text-emerald-500 mt-2">Auto-renovación activa</p>
                </div>
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Uso de Almacenamiento</p>
                  <p className="text-2xl font-black text-slate-800">1.2 GB / 10 GB</p>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-blue-600 h-full w-[12%]"></div>
                  </div>
                </div>
              </div>

              <button className="bg-[#2563EB] hover:bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">
                Gestionar Suscripción
              </button>
            </div>
          )}

          {activeTab === 'storefront' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Constructor de Landing Page</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Tu Enlace Público:</span>
                    <span className="text-[10px] font-bold text-blue-600 underline">http://10.100.5.199:3000/catalogo/{tenantData.slug || tenantId}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://10.100.5.199:3000/catalogo/${tenantData.slug || tenantId}`);
                      alert('¡Enlace copiado al portapapeles!');
                    }}
                    className="text-[10px] font-black uppercase text-slate-500 bg-white border border-slate-100 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <span>📋</span> Copiar Catálogo
                  </button>
                  <Link href={`/catalogo/${tenantData.slug || tenantId}`} target="_blank" className="text-[10px] font-black uppercase text-white bg-blue-600 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                    <span>👁️</span> Ver mi Tienda
                  </Link>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed">
                Personaliza la apariencia de tu menú digital público. Así es como tus clientes verán tu restaurante al escanear tu QR o entrar a tu enlace.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de la Empresa</label>
                      <input
                        type="text"
                        value={tenantData.name}
                        onChange={e => setTenantData({ ...tenantData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Eslogan / Descripción Corta</label>
                      <input
                        type="text"
                        value={tenantData.address}
                        onChange={e => setTenantData({ ...tenantData, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/50"
                        placeholder="Ej. Alta Gastronomía"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Enlace de tu Tienda (SLUG)</label>
                      <div className="flex gap-2">
                        <div className="bg-slate-100 px-4 py-4 rounded-l-2xl text-xs font-bold text-slate-400 flex items-center">
                          /catalogo/
                        </div>
                        <input
                          type="text"
                          value={tenantData.slug}
                          onChange={e => setTenantData({ ...tenantData, slug: e.target.value.toLowerCase().replace(/[^a-z0-z0-9-]/g, '-') })}
                          className="flex-1 bg-slate-50 border border-slate-100 rounded-r-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/50"
                          placeholder="nombre-de-tu-negocio"
                        />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-1">
                        Este es el nombre que aparecerá en tu enlace público. Ej: http://10.100.5.199:3000/catalogo/{tenantData.slug || '...'}
                      </p>
                    </div>
                  </div>

                  {/* Brand Colors */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Color Principal de Marca (Botones)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={tenantData.primaryColor}
                        onChange={e => setTenantData({ ...tenantData, primaryColor: e.target.value })}
                        className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">Color Seleccionado</p>
                        <p className="text-[10px] font-bold text-slate-400">{tenantData.primaryColor}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Images */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Logo de la Empresa (Cuadrado)</label>
                    <label className="block w-full border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center text-slate-300 font-bold hover:border-blue-100 hover:text-blue-400 cursor-pointer transition-all relative">
                      {previewLogo || tenantData.logo ? (
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={previewLogo || `http://10.100.5.199:4000${tenantData.logo}`}
                            alt="Logo"
                            className={`h-16 object-contain rounded-xl ${isUploadingLogo ? 'opacity-50' : 'opacity-100'}`}
                          />
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{isUploadingLogo ? 'Subiendo...' : 'Cambiar Logo'}</span>
                        </div>
                      ) : (
                        <span className="text-xs">{isUploadingLogo ? 'Subiendo...' : 'Subir Logo'}</span>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Imagen de Fondo (Banner)</label>
                    <label className="block w-full border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center text-slate-300 font-bold hover:border-blue-100 hover:text-blue-400 cursor-pointer transition-all relative">
                      {previewBanner || tenantData.bannerImage ? (
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={previewBanner || `http://10.100.5.199:4000${tenantData.bannerImage}`}
                            alt="Banner"
                            className={`h-16 w-full object-cover rounded-xl ${isUploadingBanner ? 'opacity-50' : 'opacity-100'}`}
                          />
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{isUploadingBanner ? 'Subiendo...' : 'Cambiar Banner'}</span>
                        </div>
                      ) : (
                        <span className="text-xs">{isUploadingBanner ? 'Subiendo...' : 'Subir Imagen de Fondo'}</span>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'banner')} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-slate-50">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : <span>🚀 Guardar Cambios</span>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black text-slate-800 mb-8">Datos de Facturación Fiscal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefijo de Factura</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900" defaultValue="NXS-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correlativo Inicial</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900" defaultValue="0001" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo de Empresa (PNG/JPG)</label>
                  <label className="block w-full border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center text-slate-300 font-bold hover:border-blue-100 hover:text-blue-400 cursor-pointer transition-all relative">
                    {previewLogo || tenantData.logo ? (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={previewLogo || `http://10.100.5.199:4000${tenantData.logo}`}
                          alt="Business Logo"
                          className={`h-20 object-contain rounded-xl transition-opacity ${isUploadingLogo ? 'opacity-50' : 'opacity-100'}`}
                        />
                        <span className="text-xs font-black text-blue-600">{isUploadingLogo ? 'Subiendo...' : 'Cambiar Logo'}</span>
                      </div>
                    ) : (
                      <span>{isUploadingLogo ? 'Preparando...' : 'Suelte el logo aquí o haga clic para subir'}</span>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                  </label>
                </div>
              </div>
              <button className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs">
                Guardar Configuración Fiscal
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black text-slate-800 mb-4">API & Conexiones Externas</h3>
              <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed">
                Usa tus API Keys para conectar ControlTotal con aplicaciones de delivery (PedidosYa, Rappi) o software contable externo.
              </p>

              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm font-black text-slate-800">Production API Key</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase">Estado: Live</p>
                  </div>
                  <button className="text-[10px] font-black text-red-400 uppercase">Revoke Key</button>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 font-mono text-xs flex justify-between items-center">
                  <span className="truncate mr-4">nxs_live_51P8X9uK2p...*****************</span>
                  <button className="text-blue-500 font-black">Copy</button>
                </div>
              </div>

              <button className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs">
                Generar Nueva Key
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
