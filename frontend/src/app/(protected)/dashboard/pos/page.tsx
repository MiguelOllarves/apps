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

  const [rates, setRates] = useState({ BCV: 55.00, EUR: 0.92, USDT: 1.01 });

  const fetchData = async () => {
    if (!tenantId) return;
    try {
      const [recRes, custRes, ratesRes] = await Promise.all([
        fetch('http://10.100.5.199:4000/recipes', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://10.100.5.199:4000/customers', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://10.100.5.199:4000/currencies/rates', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } })
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
          BCV: ratesData.VES || 55.00,
          EUR: ratesData.EUR || 0.92,
          USDT: ratesData.USDT || 1.01
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
      const res = await fetch('http://10.100.5.199:4000/orders', {
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
      const interval = setInterval(fetchPendingOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [tenantId]);

  const handleShipOrder = async (orderId: string) => {
    if (!confirm('¿Deseas despachar esta orden? Se descontarán los insumos del inventario automáticamente.')) return;
    try {
      const res = await fetch(`http://10.100.5.199:4000/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPendingOrders();
        fetchData();
      }
    } catch (e) { alert('Error al despachar orden'); }
  };

  const addToCart = (recipe: Recipe) => {
    if (!recipe.menuItem) return;
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
      const res = await fetch('http://10.100.5.199:4000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedCustomerId || (session as any)?.user?.id,
          type: 'DINE_IN',
          currencyId: recipes[0]?.menuItem?.currencyId,
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
        fetchData();
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
              .dashed-line { border-bottom: 1px dashed black; margin: 10px 0; }
            </style>
          </head>
          <body>
            \${printContent.innerHTML}
            <div class="dashed-line"></div>
            <div class="text-center mt-4"><p>¡Gracias por su compra!</p></div>
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
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
              className={`px-6 py-2 rounded-2xl text-sm font-black transition-all \${activeTab === 'direct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              Venta Directa
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-2xl text-sm font-black transition-all flex items-center gap-2 \${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              Pedidos Entrantes
              {pendingOrders.length > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-bounce">{pendingOrders.length}</span>}
            </button>
          </div>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none shadow-sm font-bold"
            />
          </div>
        </div>

        {activeTab === 'direct' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-300 font-bold animate-pulse uppercase tracking-widest">Cargando...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400 font-bold">No hay platos</div>
            ) : (
              filteredRecipes.map((recipe) => {
                const hasInsufficientStock = recipe.ingredients.some(ing => ing.rawMaterial && ing.rawMaterial.currentStock <= 0);
                return (
                  <button
                    key={recipe.id}
                    onClick={() => addToCart(recipe)}
                    disabled={hasInsufficientStock}
                    className={`bg-white p-6 rounded-[2rem] border transition-all text-left flex flex-col relative overflow-hidden group active:scale-95 \${hasInsufficientStock ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-200 hover:shadow-xl'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden">
                        {recipe.imageUrl ? <img src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `http://10.100.5.199:4000\${recipe.imageUrl}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl text-blue-600">\${recipe.menuItem?.price.toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-slate-400">Bs {(recipe.menuItem!.price * rates.BCV).toFixed(2)}</div>
                      </div>
                    </div>
                    <h3 className="font-black text-lg text-slate-800 truncate mb-2">{recipe.name}</h3>
                    {hasInsufficientStock ? <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100 w-fit">Agotado</span> : <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Disponible</span>}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-2 pb-20">
            {pendingOrders.length === 0 ? (
              <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center font-bold text-slate-400 uppercase tracking-widest">Sin pedidos pendientes</div>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-blue-300 transition-all duration-300">
                  <div className={`absolute left-0 top-0 bottom-0 w-2 \${order.type === 'DELIVERY' ? 'bg-orange-400' : 'bg-blue-500'}`}></div>
                  <div className="p-8 flex flex-col lg:flex-row gap-8 items-start relative">
                    <div className="flex gap-6 items-start flex-1 min-w-0">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-inner border border-blue-100/50">
                        {(order.customer?.name || order.user?.name || 'G').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-2xl font-black text-slate-800 truncate tracking-tight">{order.customer?.name || order.user?.name || 'Consumidor Final'}</h4>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest \${order.type === 'DELIVERY' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {order.type === 'DELIVERY' ? '🛵 A Domicilio' : '🍽️ En Local'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="opacity-50">🕒 Recepción:</span> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {order.customer?.phone && <a href={`tel:\${order.customer.phone}`} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">📱 \${order.customer.phone}</a>}
                          {order.customer?.address && <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 text-xs font-bold text-slate-500 italic">📍 \${order.customer.address}</div>}
                        </div>

                        <div className="w-full lg:w-72 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100/50">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Resumen de Pedido</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar text-xs">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between font-bold text-slate-700">
                                <span><span className="text-blue-600">{item.quantity}x</span> {item.menuItem?.recipe?.name || 'Plato'}</span>
                                <span className="text-slate-400">\${item.subTotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-auto flex flex-row lg:flex-col justify-between items-center lg:items-end gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                      <div className="lg:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-3xl font-black text-slate-800 leading-none mb-1">\${order.totalAmount.toFixed(2)}</p>
                        <p className="text-xs font-bold text-slate-400">{(order.totalAmount * rates.BCV).toLocaleString()} VES</p>
                      </div>
                      <button onClick={() => handleShipOrder(order.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-5 rounded-[1.5rem] shadow-xl text-xs uppercase tracking-widest active:scale-95 transition-all">Confirmar Pedido ⚡</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Column: Cart */}
      <div className="w-96 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-slate-800">Resumen de Venta</h3>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Carrito ({cart.length})</span>
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Cliente</label>
            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2 text-xs font-bold text-slate-700 outline-none">
              <option value="">Consumidor Final (Invitado)</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-30 text-xs font-bold text-slate-400 uppercase tracking-widest">Carrito vacío</div> : (
            cart.map(item => (
              <div key={item.menuItemId} className="flex gap-4 items-center">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h4>
                  <p className="text-xs font-bold text-blue-600">\${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center bg-slate-50 rounded-xl p-1">
                  <button onClick={() => updateCartQuantity(item.menuItemId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700">−</button>
                  <span className="w-8 text-center font-black text-slate-800 text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.menuItemId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700">+</button>
                </div>
                <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest"><span>Tasa BCV</span><span>{rates.BCV.toFixed(2)} VES</span></div>
            <div className="flex justify-between items-end pt-2 border-t border-dashed border-slate-200">
              <span className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Total Final</span>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-600 leading-none mb-1">\${totalUsd.toFixed(2)}</div>
                <div className="text-xs font-bold text-slate-500">{totalVes.toLocaleString()} VES</div>
              </div>
            </div>
          </div>
          <button disabled={cart.length === 0} onClick={handleConfirmSale} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 \${cart.length === 0 ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>💰 Confirmar Venta</button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">✔️</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">¡Venta Exitosa!</h3>
            <p className="text-sm font-medium text-slate-400 mb-8 px-4 leading-relaxed">La orden ha sido procesada y el stock actualizado.</p>
            <div id="ticket-content" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left space-y-3 font-mono text-xs">
              <div className="text-center font-bold pb-2 border-b border-dashed border-slate-200 mb-2 uppercase">ControlTotal POS</div>
              {cart.length > 0 ? cart.map((item, i) => (
                <div key={i} className="flex justify-between"><span>{item.quantity}x {item.name}</span><span>\${(item.price * item.quantity).toFixed(2)}</span></div>
              )) : lastOrder?.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between"><span>{item.quantity}x {item.menuItem?.recipe?.name || 'Plato'}</span><span>\${(item.unitPrice * item.quantity).toFixed(2)}</span></div>
              ))}
              <div className="pt-2 border-t border-dashed border-slate-200 mt-2 flex justify-between font-black text-slate-800"><span>TOTAL USD</span><span>\${(lastOrder?.totalAmount || totalUsd).toFixed(2)}</span></div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest transition-all hover:bg-blue-700">Continuar</button>
              <button onClick={handlePrintTicket} className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-800">🖨️ Imprimir Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
