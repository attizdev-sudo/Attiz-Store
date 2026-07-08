'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

const ORDER_STATUSES = [
  'Waiting for confirmation',
  'Accepted',
  'Dispatched',
  'Shipped',
  'Delivered',
];

interface OrdersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function OrdersManager({
  setErrorMsg,
  setSuccessMsg,
}: OrdersManagerProps) {
  const { orders, dbLoading, updateOrderStatus } = useStore();

  // Track order id being updated for inline loading indicator
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setUpdatingOrderId(orderId);
      const { error } = await updateOrderStatus(orderId, nextStatus);
      if (error) throw error;
      setSuccessMsg(`Order status updated to "${nextStatus}"!`);
    } catch {
      setErrorMsg('Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg text-brand-dark uppercase">
        Customer Orders
      </h3>

      {dbLoading ? (
        // Premium Skeleton Loader for Orders
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden animate-pulse"
            >
              <div className="px-5 py-4 bg-brand-cream/15 border-b border-brand-cream-dark flex justify-between">
                <div className="h-4 bg-brand-cream rounded w-24" />
                <div className="h-4 bg-brand-cream rounded w-32" />
              </div>
              <div className="px-5 py-5 space-y-2">
                <div className="h-3 bg-brand-cream rounded w-1/2" />
                <div className="h-3 bg-brand-cream rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-2xs"
              >
                <div className="px-5 py-3 bg-brand-cream/15 border-b border-brand-cream-dark flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-dark">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-brand-dark/45 text-[9px] ml-3 font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-brand-dark">
                    {order.customer_name} · {order.customer_phone}
                  </div>
                  <div className="flex items-center gap-2">
                    {isUpdating && (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
                    )}
                    <select
                      disabled={isUpdating}
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value)
                      }
                      className="text-[10px] font-bold tracking-wider border border-brand-cream-dark rounded px-2 py-1 bg-white outline-none focus:border-brand-brown cursor-pointer disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-5 py-3 flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        className="text-[10px] text-brand-dark/70 font-semibold"
                      >
                        {item.title} × {item.quantity}
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-brand-dark/45 font-bold tracking-wider uppercase">
                      Total
                    </div>
                    <div className="font-bold text-brand-brown text-sm">
                      ₹{order.total_price.toFixed(0)}
                    </div>
                    <div className="text-[9px] text-brand-dark/50 mt-1 max-w-xs">
                      {order.shipping_address}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
