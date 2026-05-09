'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCarousel from '@/components/ProductCarousel';

export default function PublicCatalogPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://10.100.5.199:4000/orders/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': menuData.tenantId
        },
        body: JSON.stringify({
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerAddress: customerData.address,
          items: cart
        }),
      });

      if (res.ok) {
        alert('¡Orden recibida con éxito! Nuestro equipo la procesará pronto.');
        setCart([]);
        setIsCheckoutOpen(false);
        setCustomerData({ name: '', phone: '', address: '' });
      }
    } catch (e) {
      alert('Error al enviar la orden. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // En una app SaaS real, buscaríamos el tenant por slug
        // Para este MVP, usaremos un endpoint que devuelva el catálogo público del tenant
        const res = await fetch(`http://10.100.5.199:4000/dashboard/public-menu/${slug}`);
        if (res.ok && res.status !== 204) {
          const text = await res.text();
          if (text) setMenuData(JSON.parse(text));
        }
      } catch (e) {
        console.error('Error fetching menu', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 animate-pulse">
      <div className="w-24 h-24 bg-slate-200 rounded-full mb-6"></div>
      <div className="w-48 h-4 bg-slate-200 rounded-full mb-3"></div>
      <div className="w-32 h-3 bg-slate-100 rounded-full"></div>
    </div>
  );

  if (!menuData) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
      <span className="text-6xl mb-6">🍽️</span>
      <h1 className="text-2xl font-black text-slate-800 mb-2">Restaurante no disponible</h1>
      <p className="text-slate-400 font-bold">El catálogo que buscas no existe o está en mantenimiento.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
        {menuData.bannerImage ? (
          <img src={`http://10.100.5.199:4000${menuData.bannerImage}`} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-40"></div>
        )}

        <div className="relative z-20 text-center px-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] p-2 shadow-2xl mx-auto mb-4 border-4 border-white overflow-hidden">
            {menuData.logo ? (
              <img src={`http://10.100.5.199:4000${menuData.logo}`} className="w-full h-full object-contain" alt="Logo" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-black text-blue-600">
                {menuData.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">{menuData.name}</h1>
          <p className="text-slate-300 font-medium mt-1 text-sm md:text-base">{menuData.address || 'Alta Gastronomía'}</p>
        </div>
      </div>

      {/* Categories Bar (Sticky) */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 py-4 px-6 overflow-x-auto no-scrollbar flex gap-4">
        {menuData.categories.map((cat: any) => (
          <a key={cat.id} href={`#cat-${cat.id}`} className="whitespace-nowrap px-6 py-2 bg-slate-50 rounded-full text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            {cat.name}
          </a>
        ))}
      </div>

      {/* Menu List */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        {menuData.categories.map((cat: any) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-800 inline-block relative">
                {cat.name}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-blue-600 rounded-full"></div>
              </h2>
            </div>
            <div className="w-full">
              <ProductCarousel
                items={cat.menuItems}
                renderItem={(item: any) => (
                  <div key={item.id} className="group bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-full aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-6 shadow-inner relative">
                      {item.recipe?.imageUrl ? (
                        <img
                          src={item.recipe.imageUrl.startsWith('http') ? item.recipe.imageUrl : `http://10.100.5.199:4000${item.recipe.imageUrl}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={item.recipe?.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                          🍽️
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">Premium</span>
                      </div>
                    </div>

                    <h3 className="font-black text-slate-800 text-xl leading-tight mb-2">{item.recipe?.name}</h3>
                    <p className="text-sm font-medium text-slate-400 mb-6 flex-1 leading-relaxed">
                      {item.recipe?.description || 'Preparado con ingredientes frescos de la mejor calidad seleccionados por nuestro chef.'}
                    </p>

                    <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-4">
                      <span className="font-black text-blue-600 text-2xl tracking-tight">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-200"
                      >
                        Añadir a la Orden
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          </section>
        ))}
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 border-t border-slate-50 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Experiencia potenciada por</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
          <span className="text-xl font-black text-slate-800">ControlTotal</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-8">© 2026 {menuData.name} • Todos los derechos reservados.</p>
      </footer>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="fixed bottom-8 right-8 left-8 md:right-12 md:left-auto md:w-80 bg-blue-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 duration-500 hover:bg-blue-700 transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              {cart.length}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Ver mi pedido</p>
              <p className="text-lg font-black leading-none">${cartTotal.toFixed(2)}</p>
            </div>
          </div>
          <span className="text-2xl">⚡</span>
        </button>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-20 duration-500">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Finalizar Pedido</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completa tus datos de envío / mesa</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-600 border border-slate-100">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none mb-1">{item.recipe?.name}</p>
                        <p className="text-xs text-slate-400 font-bold">${item.price.toFixed(2)} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-slate-800">${(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-50"></div>

              <form onSubmit={handleCheckout} id="checkout-form" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tu Nombre*</label>
                    <input
                      type="text"
                      required
                      value={customerData.name}
                      onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">WhatsApp / Teléfono*</label>
                    <input
                      type="tel"
                      required
                      value={customerData.phone}
                      onChange={e => setCustomerData({ ...customerData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400"
                      placeholder="Ej. +58 412..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mesa o Dirección de Entrega*</label>
                  <textarea
                    required
                    value={customerData.address}
                    onChange={e => setCustomerData({ ...customerData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 h-24 resize-none"
                    placeholder="Indica el número de mesa o tu dirección exacta para delivery..."
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total a Pagar</span>
                <span className="text-3xl font-black text-slate-800">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Enviando pedido...
                  </>
                ) : (
                  'Confirmar Pedido ⚡'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
