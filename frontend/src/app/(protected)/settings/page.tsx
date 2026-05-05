'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('plan');
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const tabs = [
    { id: 'storefront', name: 'Mi Tienda Online', icon: '🛍️' },
    { id: 'plan', name: 'Plan SaaS', icon: '💎' },
    { id: 'billing', name: 'Facturación', icon: '🧾' },
    { id: 'api', name: 'API & Integraciones', icon: '🔗' },
  ];

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:4000/uploads/image', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url);
        // alert('Logo subido con éxito');
      }
    } catch (err) {
      console.error('Error uploading logo', err);
    } finally {
      setIsUploading(false);
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
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all text-left ${
                activeTab === tab.id 
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
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-800">Constructor de Landing Page</h3>
                 <a href={`/catalogo/${(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tenantId') || '"{}"') : 'demo')}`} target="_blank" className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors">
                   <span>👁️</span> Previsualizar Tienda
                 </a>
               </div>
               
               <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed">
                 Personaliza la apariencia de tu menú digital público. Así es como tus clientes verán tu restaurante al escanear tu QR o entrar a tu enlace.
               </p>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-8">
                    {/* Brand Colors */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-[family-name:var(--font-geist-sans)]">
                        Color Principal de Marca (Botones)
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="color" defaultValue="#2563EB" className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800">Azul Zafiro (Default)</p>
                          <p className="text-[10px] font-bold text-slate-400">#2563EB</p>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        Número WhatsApp (Recepción de Pedidos)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-sm font-bold text-slate-400">+</span>
                        <input type="text" placeholder="584141234567" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-8 pr-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/50" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Tienda Status */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-black text-slate-800">Estado de Operaciones</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">¿Aceptar pedidos online?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Social Media */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Instagram Handle (Opcional)</label>
                        <div className="flex">
                           <span className="bg-slate-50 border border-slate-100 border-r-0 rounded-l-2xl px-4 py-3 text-sm font-bold text-slate-400 flex items-center">@</span>
                           <input type="text" placeholder="mirestaurante" className="w-full bg-slate-50 border border-slate-100 rounded-r-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-300" />
                        </div>
                      </div>
                    </div>

                  </div>
               </div>
               
               <div className="flex justify-end pt-8 border-t border-slate-50">
                 <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2">
                   <span>🚀</span> Publicar Tienda
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
                      {previewUrl || logoUrl ? (
                        <div className="flex flex-col items-center gap-4">
                           <img 
                            src={previewUrl || `http://127.0.0.1:4000${logoUrl}`} 
                            alt="Business Logo" 
                            className={`h-20 object-contain rounded-xl transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`} 
                           />
                           <span className="text-xs font-black text-blue-600">{isUploading ? 'Subiendo...' : 'Cambiar Logo'}</span>
                        </div>
                      ) : (
                        <span>{isUploading ? 'Preparando...' : 'Suelte el logo aquí o haga clic para subir'}</span>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
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
