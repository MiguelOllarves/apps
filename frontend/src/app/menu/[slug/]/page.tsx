'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PublicMenuPage() {
    const { slug } = useParams();
    const [data, setData] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        tableNumber: ''
    });
    const [orderStatus, setOrderStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');

    useEffect(() => {
        fetch(`http://10.100.5.199:4000/public-menu/${slug}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderStatus('SENDING');
        try {
            const res = await fetch('http://10.100.5.199:4000/orders/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: data.tenantId,
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone,
                    customerAddress: customerInfo.address,
                    tableNumber: customerInfo.tableNumber,
                    items: cart
                })
            });

            if (res.ok) {
                setOrderStatus('SUCCESS');
                setCart([]);
            } else {
                setOrderStatus('ERROR');
            }
        } catch (err) {
            setOrderStatus('ERROR');
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Cargando Menú...</div>;
    if (!data || !data.menu) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-500">Restaurante no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24">
            {/* Header / Hero */}
            <div className="bg-[#2563EB] text-white p-12 text-center shadow-xl">
                 <h1 className="text-4xl font-black tracking-tighter mb-2">{data.restaurantName}</h1>
                 <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Menú Digital Autogestionado</p>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-12 mt-8">
                {data.menu.map((cat: any) => (
                    <section key={cat.name}>
                        <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-4 border-blue-500 w-fit pb-1">{cat.name}</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {cat.items.map((item: any) => (
                                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-black">${item.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-4">{item.description || 'Delicioso plato preparado con ingredientes frescos.'}</p>
                                    </div>
                                    <button 
                                        onClick={() => addToCart(item)}
                                        className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-black transition-all text-sm uppercase tracking-widest"
                                    >
                                        + Agregar al Pedido
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Floating Checkout Button */}
            {cart.length > 0 && !isCheckoutOpen && (
                <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="fixed bottom-8 right-8 bg-[#2563EB] text-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/40 flex items-center gap-4 animate-bounce-slow active:scale-95 transition-all z-40"
                >
                    <div className="bg-white/20 p-2 rounded-xl">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Finalizar Pedido</p>
                        <p className="text-xl font-black tracking-tighter">{cart.length} Items • ${total.toFixed(2)}</p>
                    </div>
                </button>
            )}

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-end p-0">
                    <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tu Orden</h3>
                            <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {orderStatus === 'SUCCESS' ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl shadow-inner shadow-emerald-500/20">✓</div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">¡Pedido Recibido!</h4>
                                        <p className="text-slate-500 font-bold text-sm mt-2">Estamos preparando tu comida. El mesero se acercará pronto o iniciaremos el despacho.</p>
                                    </div>
                                    <button onClick={() => setIsCheckoutOpen(false)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest">Cerrar</button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Seleccionados</p>
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.name}</p>
                                                    <p className="text-xs font-bold text-blue-500">Cant: {item.quantity}</p>
                                                </div>
                                                <p className="font-black text-slate-800">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <form id="orderForm" onSubmit={handleCheckout} className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-8">Tus Datos</p>
                                        <input 
                                            type="text" 
                                            placeholder="Tu Nombre*" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" 
                                            required
                                            value={customerInfo.name}
                                            onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Teléfono*" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" 
                                            required
                                            value={customerInfo.phone}
                                            onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Mesa (Opcional)" 
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                                                value={customerInfo.tableNumber}
                                                onChange={e => setCustomerInfo({...customerInfo, tableNumber: e.target.value})}
                                            />
                                            <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total</span>
                                                <span className="font-black text-blue-700 text-lg">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <textarea 
                                            placeholder="Dirección (Si es para domicilio)" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold h-24"
                                            value={customerInfo.address}
                                            onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                                        ></textarea>
                                    </form>
                                </>
                            )}
                        </div>

                        {orderStatus !== 'SUCCESS' && (
                            <div className="p-8 border-t border-slate-100 bg-white">
                                <button 
                                    form="orderForm"
                                    type="submit"
                                    disabled={orderStatus === 'SENDING'}
                                    className="w-full py-5 bg-[#2563EB] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {orderStatus === 'SENDING' ? 'Enviando...' : 'Confirmar mi Pedido'}
                                </button>
                                {orderStatus === 'ERROR' && <p className="text-red-500 text-xs font-bold text-center mt-4 uppercase">Error al enviar pedido. Intenta de nuevo.</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
