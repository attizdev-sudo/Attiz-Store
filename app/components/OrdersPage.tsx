'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, CheckCircle2, ChevronRight, ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders: allOrders, dbLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user, router]);

  const userOrders = allOrders.filter((o) => o.user_id === user?.id);

  return (
    <div className="min-h-screen bg-brand-cream/15 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/')} className="mb-8 flex items-center space-x-2 text-[10px] font-bold tracking-widest text-brand-dark hover:text-brand-brown transition-colors uppercase cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-serif text-3xl font-light tracking-[0.25em] text-brand-dark uppercase">Your Orders</h1>
          <p className="font-sans text-[11px] text-brand-dark/45 font-bold tracking-widest uppercase mt-1">Track order status and confirmations in real-time.</p>
        </div>

        {dbLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-brand-dark/45">
            <div className="w-8 h-8 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
            <span className="font-sans text-xs font-bold tracking-widest uppercase">Loading your orders...</span>
          </div>
        ) : userOrders.length === 0 ? (
          <div className="bg-white border border-brand-cream-dark rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <ClipboardList className="w-12 h-12 text-brand-dark/30 stroke-[1.2]" />
            <h3 className="font-sans text-xs font-bold tracking-widest text-brand-dark uppercase">No orders found</h3>
            <p className="font-sans text-xs text-brand-dark/60 tracking-wider max-w-sm mx-auto leading-relaxed">You haven&apos;t placed any orders yet.</p>
            <button onClick={() => router.push('/')} className="mt-2 px-8 py-3 rounded bg-brand-brown hover:bg-brand-brown-dark text-white text-[10px] font-bold tracking-wider uppercase transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => {
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

              let bg = 'bg-brand-cream/20 text-brand-dark border-brand-cream-dark';
              let icon = <Clock className="w-3.5 h-3.5" />;
              let animate = '';
              switch (order.status) {
                case 'Waiting for confirmation': bg = 'bg-orange-50 text-orange-700 border-orange-200'; icon = <Clock className="w-3.5 h-3.5 animate-pulse" />; animate = 'animate-pulse'; break;
                case 'Accepted': bg = 'bg-blue-50 text-blue-700 border-blue-200'; icon = <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />; break;
                case 'Dispatched': bg = 'bg-indigo-50 text-indigo-700 border-indigo-200'; icon = <Package className="w-3.5 h-3.5 text-indigo-700" />; break;
                case 'Shipped': bg = 'bg-purple-50 text-purple-700 border-purple-200'; icon = <ChevronRight className="w-3.5 h-3.5 text-purple-700 rotate-90" />; break;
                case 'Delivered': bg = 'bg-green-50 text-green-700 border-green-200'; icon = <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />; break;
                default: bg = 'bg-green-50 text-green-700 border-green-200'; icon = <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />;
              }

              return (
                <div key={order.id} className="bg-white border border-brand-cream-dark rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-brand-cream/15 border-b border-brand-cream-dark flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="block font-sans text-[9px] font-bold text-brand-dark/45 tracking-widest uppercase">Order ID</span>
                      <span className="font-mono text-xs font-bold text-brand-dark uppercase">#{order.id.slice(0, 8)}</span>
                    </div>
                    <div>
                      <span className="block font-sans text-[9px] font-bold text-brand-dark/45 tracking-widest uppercase">Date Placed</span>
                      <span className="font-sans text-xs font-semibold text-brand-dark">{orderDate}</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${bg} ${animate}`}>
                      {icon}
                      <span>{order.status || 'Order Confirmed'}</span>
                    </div>
                  </div>

                  <div className="p-6 divide-y divide-brand-cream-dark">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-14 bg-brand-cream rounded-md overflow-hidden flex-shrink-0 border border-brand-cream-dark">
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                          </div>
                          <div>
                            <h4 className="font-sans text-xs font-bold text-brand-dark line-clamp-1">{item.title}</h4>
                            <span className="font-sans text-[10px] text-brand-dark/50 tracking-wider">Qty: {item.quantity} × Rs. {item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <span className="font-sans text-xs font-bold text-brand-dark">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 bg-brand-cream/5 border-t border-brand-cream-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="max-w-md">
                      <span className="block font-sans text-[9px] font-bold text-brand-dark/45 tracking-widest uppercase mb-1">Shipping Address</span>
                      <p className="font-sans text-brand-dark/75 tracking-wider leading-relaxed">{order.shipping_address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block font-sans text-[9px] font-bold text-brand-dark/45 tracking-widest uppercase">Total Price</span>
                      <span className="font-sans text-base font-extrabold text-brand-brown mt-0.5 block">Rs. {order.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
