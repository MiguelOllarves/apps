'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Ingredient {
  rawMaterialId: string;
  quantity: number;
  unit: string;
  rawMaterial?: {
    name: string;
    currentStock: number;
    unit: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  menuItem?: {
    id: string;
    price: number;
    currencyId: string;
  };
  imageUrl?: string;
}

interface CartItem {
  menuItemId: string;
  recipeId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'pending'>('direct');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  const [rates, setRates] = useState({ BCV: 481.21, EUR: 0.92, USDT: 1.01 });

  const fetchData = async () => {
    if (!tenantId) return;
    try {
      const [recRes, custRes, ratesRes] = await Promise.all([
        fetch('http://127.0.0.1:4000/recipes', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://127.0.0.1:4000/customers', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://127.0.0.1:4000/currencies/rates', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } })
      ]);

      if (recRes.ok) {
        const data = await recRes.json();
        setRecipes(data.filter((r: any) => r.menuItem));
      }
      if (custRes.ok) {
        setCustomers(await custRes.json());
      }
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        setRates({
          BCV: ratesData.VES,
          EUR: ratesData.EUR,
          USDT: ratesData.USDT
        });
      }
    } catch (e) {
      console.error('Error cargando menú', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    if (!tenantId) return;
    try {
      const res = await fetch('http://127.0.0.1:4000/orders', {
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingOrders(data.filter((o: any) => o.status === 'PENDING'));
      }
    } catch (e) { console.error('Error fetching pending orders', e); }
  };

  useEffect(() => {
    fetchData();
    if (tenantId) {
      fetchPendingOrders();
      const interval = setInterval(fetchPendingOrders, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [tenantId]);

  const handleShipOrder = async (orderId: string) => {
    if (!confirm('¿Deseas despachar esta orden? Se descontarán los insumos del inventario automáticamente.')) return;
    try {
      const res = await fetch(`http://127.0.0.1:4000/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPendingOrders();
        fetchData(); // Refresh stock
      }
    } catch (e) { alert('Error al despachar orden'); }
  };

  const addToCart = (recipe: Recipe) => {
    if (!recipe.menuItem) return;

    // Check if ingredient stock is sufficient (simplified: just check if any is 0)
    const hasInsufficientStock = recipe.ingredients.some(
      ing => ing.rawMaterial && ing.rawMaterial.currentStock <= 0
    );
    if (hasInsufficientStock) return;

    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === recipe.menuItem?.id);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === recipe.menuItem?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        menuItemId: recipe.menuItem!.id,
        recipeId: recipe.id,
        name: recipe.name,
        price: recipe.menuItem!.price,
        quantity: 1
      }];
    });
  };

  const updateCartQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const totalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalVes = totalUsd * rates.BCV;

  const handleConfirmSale = async () => {
    if (cart.length === 0 || !tenantId) return;

    try {
      const res = await fetch('http://127.0.0.1:4000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedCustomerId || (session as any)?.user?.id,
          type: 'DINE_IN',
          currencyId: recipes[0]?.menuItem?.currencyId, // Usar la del primer item por simplicidad
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        setLastOrder(orderData);
        setIsSuccessModalOpen(true);
        setCart([]);
        fetchData(); // Refresh stock
      }
    } catch (err) {
      console.error('Error procesando venta', err);
    }
  };

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintTicket = () => {
    const printContent = document.getElementById('ticket-content');
    if (!printContent) return;
    const windowPrint = window.open('', '', 'width=400,height=600');
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Ticket de Compra</title>
            <style>
              body { font-family: monospace; padding: 20px; font-size: 14px; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .mb-2 { margin-bottom: 8px; }
              .mt-4 { margin-top: 16px; }
              .flex { display: flex; justify-content: space-between; }
              .dashed-line { border-bottom: 1px dashed black; margin: 10px 0; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <div class="dashed-line"></div>
            <div class="text-center mt-4">
              <p>¡Gracias por su compra!</p>
            </div>
            <script>
              setTimeout(() => { window.print(); window.close(); }, 500);
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 animate-in fade-in duration-500">

      {/* Left Column: Menu Items */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-6 py-2 rounded-2xl text-sm font-black transition-all ${activeTab === 'direct' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              Venta Directa
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              Pedidos Entrantes
              {pendingOrders.length > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-bounce">{pendingOrders.length}</span>}
            </button>
          </div>
          <div className="relative w-72">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/30 font-bold text-slate-700 shadow-sm"
            />
          </div>
        </div>

        {activeTab === 'direct' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-300 font-bold animate-pulse text-xl tracking-widest uppercase">Consultando disponibilidad...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                <span className="text-5xl">🍔</span>
                <p className="font-bold text-slate-400 uppercase tracking-widest">No se encontraron platos</p>
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                const hasInsufficientStock = recipe.ingredients.some(
                  ing => ing.rawMaterial && ing.rawMaterial.currentStock <= 0
                );

                return (
                  <button
                    key={recipe.id}
                    onClick={() => addToCart(recipe)}
                    disabled={hasInsufficientStock}
                    className={`bg-white p-6 rounded-[2rem] border transition-all text-left flex flex-col relative overflow-hidden group active:scale-95 ${hasInsufficientStock
                      ? 'border-slate-100 opacity-60 cursor-not-allowed text-slate-400'
                      : 'border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 text-slate-800'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `http://127.0.0.1:4000${recipe.imageUrl}`}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          hasInsufficientStock ? '⚠️' : '🍽️'
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl text-[#2563EB]">
                          ${recipe.menuItem?.price.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          Bs {(recipe.menuItem!.price * rates.BCV).toFixed(2)} | € {(recipe.menuItem!.price * rates.EUR).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-black text-lg leading-tight mb-2 truncate pr-2">{recipe.name}</h3>

                    {hasInsufficientStock ? (
                      <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        Insumos insuficientes
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Disponible</span>
                      </div>
                    )}

                    {!hasInsufficientStock && (
                      <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 pb-8">
            {pendingOrders.length === 0 ? (
              <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                <span className="text-5xl">📦</span>
                <p className="font-bold text-slate-400 uppercase tracking-widest">No hay pedidos pendientes</p>
              </div>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-blue-200 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black">
                      {order.user?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-black text-slate-800">{order.user?.name || 'Invitado'}</h4>
                        <span className="px-3 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {order.type} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl font-black text-slate-800">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleShipOrder(order.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                      Confirmar y Despachar ⚡
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Column: Cart */}
      <div className="w-96 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Resumen de Venta</h3>
            <span className="bg-blue-50 text-[#2563EB] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Carrito ({cart.length})</span>
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Vincular Cliente</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-300"
            >
              <option value="">Consumidor Final (Invitado)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-30">
              <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.name}</h4>
                  <p className="text-xs font-bold text-[#2563EB] tracking-tight">${item.price.toFixed(2)} / ud.</p>
                </div>
                <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100/50">
                  <button onClick={() => updateCartQuantity(item.menuItemId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">−</button>
                  <span className="w-10 text-center font-black text-slate-800 text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.menuItemId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">+</button>
                </div>
                <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tasa BCV</span>
              <span className="font-black text-slate-600">{rates.BCV.toFixed(2)} VES</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 border-dashed">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Otras Monedas</span>
              <div className="text-right text-[10px] text-slate-500 font-medium">
                {rates.EUR.toFixed(2)} EUR | {rates.USDT.toFixed(2)} USDT
              </div>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="font-black text-slate-800 uppercase tracking-wider">Total Final</span>
              <div className="text-right">
                <div className="text-3xl font-black text-[#2563EB] leading-none mb-1">${totalUsd.toFixed(2)}</div>
                <div className="text-xs font-bold text-slate-500">{totalVes.toLocaleString('es-VE')} VES</div>
                <div className="text-[10px] font-bold text-slate-400">{(totalUsd * rates.EUR).toFixed(2)} EUR | {(totalUsd * rates.USDT).toFixed(2)} USDT</div>
              </div>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleConfirmSale}
            className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${cart.length === 0
              ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-blue-500/20'
              }`}
          >
            <span>💰</span> Confirmar Venta
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-bounce">
                ✔️
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">¡Venta Exitosa!</h3>
              <p className="text-sm font-medium text-slate-400 mb-8 px-4 leading-relaxed">
                La orden #{lastOrder?.id?.slice(-6).toUpperCase()} ha sido procesada y el stock de insumos actualizado.
              </p>

              <div id="ticket-content" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left space-y-3 font-[family-name:var(--font-geist-mono)]">
                <div className="text-center pb-3 border-b border-dashed border-slate-200 mb-2">
                  <p className="font-black text-slate-800">ControlTotal POS</p>
                  <p className="text-[10px] text-slate-400 uppercase">Factura de Consumo</p>
                </div>
                {cart.length > 0 ? cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )) : lastOrder?.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{item.quantity}x {item.menuItem?.recipe?.name || 'Plato'}</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-dashed border-slate-200 mt-2 flex justify-between font-black text-slate-800">
                  <span>TOTAL USD</span>
                  <span>${(lastOrder?.totalAmount || totalUsd).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                  <span>TOTAL BS</span>
                  <span>Bs. {((lastOrder?.totalAmount || totalUsd) * rates.BCV).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                >
                  Continuar Vendiendo
                </button>
                <button
                  onClick={handlePrintTicket}
                  className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest text-xs"
                >
                  🖨️ Imprimir Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
