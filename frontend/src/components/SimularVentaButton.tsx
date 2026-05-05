'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  tenantId: string;
  userId: string;
  currencyId: string; // needed for order
  menuItemId: string; // what to sell
  menuItemName: string;
  price: number;
}

export default function SimularVentaButton({ tenantId, userId, currencyId, menuItemId, menuItemName, price }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimularVenta = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:4000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId,
          type: 'DINE_IN',
          tableNumber: 'Mesa 4',
          currencyId,
          items: [
            {
              menuItemId,
              quantity: 1,
              unitPrice: price
            }
          ]
        })
      });

      if (res.ok) {
        // Force refresh the server components to update the dashboard!
        router.refresh();
      } else {
        console.error('Failed to create order');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimularVenta}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center min-w-[150px] disabled:opacity-75 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      ) : (
        `+ Simular Venta (${menuItemName})`
      )}
    </button>
  );
}
