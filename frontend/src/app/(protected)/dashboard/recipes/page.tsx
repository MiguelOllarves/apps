'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NumericInput } from '@/components/ui/NumericInput';

interface RecipeFormData {
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  categoryId: string;
  ingredients: {
    rawMaterialId: string;
    subRecipeId: string | null;
    quantity: number;
    unit: string;
  }[];
}

export default function RecipesPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    price: 0,
    imageUrl: '',
    description: '',
    categoryId: '',
    ingredients: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formPayload = new FormData();
    formPayload.append('file', file);

    try {
      const res = await fetch('http://10.100.5.199:4000/api/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, imageUrl: data.url });
      }
    } catch (err) {
      console.error('Error uploading recipe image', err);
    } finally {
      setIsUploading(false);
    }
  };

  const [costSummary, setCostSummary] = useState({
    baseCost: 0,
    suggestedPrice: 0,
    recommendedPrice: 0,
    margin: 0
  });

  const UNIT_FACTORS: Record<string, number> = {
    G: 1, KG: 1000, LB: 453.59, OZ: 28.35,
    ML: 1, L: 1000, OZ_FL: 29.57, GAL: 3785.41,
    UNIT: 1, DOZEN: 12, PACK: 1, BOX: 1
  };

  // Cerebro Logic: Auto-calculate costs
  useEffect(() => {
    let totalCost = 0;
    formData.ingredients.forEach(ing => {
      const material = materials.find(m => m.id === ing.rawMaterialId);
      if (material) {
        // Yield factor: (100 - shrinkage) / 100
        const yieldFactor = (100 - (material.shrinkagePercentage || 0)) / 100;
        const netCostPerMaterialUnit = (material.baseCost || 0) / yieldFactor;

        // Universal Conversion Logic:
        // 1. Convert ingredient quantity to base unit (e.g. G or ML)
        // 2. Convert material cost (which is per its own unit)
        // Effective Qty in Material Unit = (Ing Qty * Ing Factor) / Mat Factor
        const ingFactor = UNIT_FACTORS[ing.unit] || 1;
        const matFactor = UNIT_FACTORS[material.unit] || 1;

        let adjustedMatFactor = matFactor;
        const isIngMassVolume = ['G', 'KG', 'LB', 'OZ', 'ML', 'L', 'OZ_FL', 'GAL'].includes(ing.unit);
        const isMatDiscrete = ['UNIT', 'PACK', 'DOZEN', 'BOX'].includes(material.unit);

        if (isIngMassVolume && isMatDiscrete && matFactor === 1) {
          adjustedMatFactor = 1000;
        }

        const effectiveQtyInMatUnit = (ing.quantity * ingFactor) / adjustedMatFactor;
        totalCost += effectiveQtyInMatUnit * (material.baseCost || 0);
      }
    });

    setCostSummary({
      baseCost: totalCost,
      suggestedPrice: totalCost / 0.7, // 30% Margin
      recommendedPrice: Math.ceil(totalCost / 0.7),
      margin: 30
    });
  }, [formData.ingredients, materials]);

  const tenantId = (session as any)?.tenantId || '';
  const token = (session as any)?.accessToken || '';

  const fetchData = async () => {
    if (!tenantId || !session) return;
    try {
      const [recRes, matRes, curRes, catRes] = await Promise.all([
        fetch('http://10.100.5.199:4000/recipes', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://10.100.5.199:4000/materials', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://10.100.5.199:4000/currencies', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } }),
        fetch('http://10.100.5.199:4000/categories', { headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` } })
      ]);

      if (recRes.ok) {
        setRecipes(await recRes.json());
        setError(null);
      } else if (recRes.status === 401) {
        setError('Sesión expirada. Por favor, re-inicia sesión.');
      } else {
        setError('Servidor no disponible');
      }
      if (matRes.ok) setMaterials(await matRes.json());
      if (curRes.ok) setCurrencies(await curRes.json());
      if (catRes.ok) setCategories(await catRes.json());
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

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { rawMaterialId: '', subRecipeId: null, quantity: 0, unit: 'G' }]
    });
  };

  const updateIngredient = (index: number, updates: Record<string, any>) => {
    setFormData(prev => {
      const newIngs = [...prev.ingredients];
      newIngs[index] = { ...newIngs[index], ...updates };
      return { ...prev, ingredients: newIngs };
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
  };

  const handleEdit = (recipe: any) => {
    setIsEditing(true);
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      price: recipe.menuItem?.price || 0,
      imageUrl: recipe.imageUrl || '',
      description: recipe.description || '',
      categoryId: recipe.categoryId || '',
      ingredients: recipe.ingredients.map((ing: any) => ({
        rawMaterialId: ing.rawMaterialId,
        subRecipeId: ing.subRecipeId,
        quantity: ing.quantity,
        unit: ing.unit
      }))
    });
    setPreviewUrl(recipe.imageUrl ? `http://10.100.5.199:4000${recipe.imageUrl}` : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plato?')) return;
    try {
      const res = await fetch(`http://10.100.5.199:4000/recipes/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error eliminando plato', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      const usdCurrency = (currencies || []).find((c: any) => c.code === 'USD') || { id: 'usd-mock' };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';
      const url = isEditing ? `${baseUrl}/recipes/${editingId}` : `${baseUrl}/recipes`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          currencyId: usdCurrency?.id
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', price: 0, imageUrl: '', description: '', categoryId: '', ingredients: [] });
        setPreviewUrl(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error guardando plato', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Recetario & Costos</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Análisis de rentabilidad operativo • ControlTotal</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ name: '', price: 0, imageUrl: '', description: '', categoryId: '', ingredients: [] }); setPreviewUrl(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 group">
          <span className="mr-2">🍳</span> Crear Nuevo Plato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-bold animate-pulse text-2xl">Cargando recetario...</div>
        ) : error ? (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center gap-4 text-red-500 font-bold shadow-sm">
            <span className="text-5xl text-red-300 animate-pulse">📡</span>
            <p className="uppercase tracking-[0.2em] text-xs font-black">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="px-6 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              Reintentar
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400 font-bold">
            <span className="text-5xl">🥙</span>
            <p>No hay platos registrados.</p>
          </div>
        ) : (
          recipes.filter(r => r.menuItem).map((recipe: any) => {
            const costUsd = recipe.genericCost || 0;
            const priceUsd = recipe.menuItem?.price || 0;
            const margin = priceUsd > 0 ? ((priceUsd - costUsd) / priceUsd) * 100 : 0;
            return (
              <div key={recipe.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="flex gap-4 mb-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden text-2xl">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `http://10.100.5.199:4000${recipe.imageUrl}`}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    ) : '🍽️'}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{recipe.name}</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Costo</span><span>${costUsd.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-black text-blue-600"><span>Venta</span><span>${priceUsd.toFixed(2)}</span></div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(recipe)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(recipe.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margen</div>
                    <div className={`text-xl font-black ${margin > 0 ? 'text-emerald-500' : 'text-red-500'}`}>+{margin.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Editar Plato' : 'Crear Nuevo Plato'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre Comercial del Plato*</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Categoría del Plato*</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.filter(c => c.type === 'MENU_ITEM' || c.name === 'Entradas' || c.name === 'Platos').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descripción del Plato</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-900 h-24 resize-none"
                      placeholder="Ej: Jugosa carne a la parrilla con queso fundido..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Foto del Plato</label>
                    <label className="flex w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-300 transition-colors">
                      <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-xl">
                        {previewUrl ? (
                          <img src={previewUrl} className="w-full h-full object-cover" />
                        ) : formData.imageUrl ? (
                          <img
                            src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://10.100.5.199:4000${formData.imageUrl}`}
                            className="w-full h-full object-cover"
                          />
                        ) : '📸'}
                      </div>
                      <div className="ml-4 flex flex-col justify-center">
                        <span className="text-xs font-bold text-blue-600">{isUploading ? 'Subiendo...' : 'Toca para subir foto'}</span>
                        <span className="text-[10px] text-slate-400">Público en la Landing Page</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Intelligence Analysis</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500">Costo Base</span>
                      <span className="text-sm font-black text-slate-800">${costSummary.baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500">Margen Sugerido (30%)</span>
                      <span className="text-sm font-black text-emerald-500">${costSummary.suggestedPrice.toFixed(2)}</span>
                    </div>
                    <hr className="my-3 border-blue-100/30" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-blue-600">Recomendado</span>
                      <span className="text-lg font-black text-blue-600">${costSummary.recommendedPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <NumericInput
                      label="Precio de Venta Final ($)*"
                      value={formData.price}
                      onValueChange={v => setFormData({ ...formData, price: Number(v.value) })}
                      prefix="$ "
                      decimalScale={2}
                      fixedDecimalScale={true}
                      allowNegative={false}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ingredientes</label>
                  <button type="button" onClick={addIngredient} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Agregar Insumo</button>
                </div>
                <div className="space-y-3">
                  {formData.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <select
                        value={ing.rawMaterialId}
                        onChange={e => updateIngredient(idx, { rawMaterialId: e.target.value })}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        required
                      >
                        <option value="" className="text-slate-900">Insumo...</option>
                        {materials.map(m => <option key={m.id} value={m.id} className="text-slate-900">{m.name}</option>)}
                      </select>
                      <NumericInput
                        value={ing.quantity}
                        onValueChange={v => updateIngredient(idx, { quantity: Number(v.value) })}
                        className="w-20 px-3 py-2 text-xs rounded-xl"
                        placeholder="Cant."
                      />
                      <select
                        value={ing.unit}
                        onChange={e => updateIngredient(idx, { unit: e.target.value })}
                        className="w-24 bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900"
                        required
                      >
                        <optgroup label="Peso">
                          <option value="G">g</option>
                          <option value="KG">kg</option>
                          <option value="LB">lb</option>
                          <option value="OZ">oz</option>
                        </optgroup>
                        <optgroup label="Volumen">
                          <option value="ML">ml</option>
                          <option value="L">L</option>
                          <option value="OZ_FL">fl oz</option>
                          <option value="GAL">gal</option>
                        </optgroup>
                        <optgroup label="Unidades">
                          <option value="UNIT">und</option>
                          <option value="PACK">pack</option>
                          <option value="DOZEN">docena</option>
                          <option value="BOX">caja</option>
                        </optgroup>
                      </select>
                      <button type="button" onClick={() => removeIngredient(idx)} className="text-red-400">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all">{isEditing ? 'Guardar Cambios' : 'Guardar Plato'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
