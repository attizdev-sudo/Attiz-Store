'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Order } from '@/lib/types';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Save,
  Truck,
  DollarSign,
  PackageCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus
} from 'lucide-react';

const ORDER_STATUSES = [
  'Waiting for confirmation',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

interface OrdersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function OrdersManager({
  setErrorMsg,
  setSuccessMsg,
}: OrdersManagerProps) {
  const { orders, dbLoading, updateOrderStatus, updateOrderDetails, deleteOrder, refreshData } = useStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('All');

  // Inline updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [pushingOrderId, setPushingOrderId] = useState<string | null>(null);

  const handlePushToShiprocket = async (orderId: string) => {
    setPushingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/shiprocket/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Order successfully pushed to Shiprocket! (ID: ${data.shiprocket?.shiprocket_order_id || 'Done'})`);
        if (refreshData) await refreshData();
      } else {
        setErrorMsg(data.error || 'Failed to push order to Shiprocket.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error pushing to Shiprocket.');
    } finally {
      setPushingOrderId(null);
    }
  };

  // Edit Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<{
    status: string;
    payment_status: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address1: string;
    shipping_address2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    discount: number;
    shipping_charge: number;
    items: Array<{
      id?: string;
      product_id?: string;
      variant_id?: string;
      title: string;
      size?: string;
      color?: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const pendingCount = orders.filter(
      (o) => o.status === 'Waiting for confirmation' || o.status === 'Processing' || o.status === 'Confirmed'
    ).length;
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

    return { totalCount, totalRevenue, pendingCount, deliveredCount };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (selectedStatusFilter !== 'All' && order.status !== selectedStatusFilter) {
        return false;
      }
      // Payment Filter
      if (selectedPaymentFilter !== 'All' && order.payment_status !== selectedPaymentFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderNum = (order.order_number || order.id || '').toLowerCase();
        const name = (order.shipping_name || order.customer_name || '').toLowerCase();
        const phone = (order.shipping_phone || order.customer_phone || '').toLowerCase();
        const city = (order.shipping_city || '').toLowerCase();
        const state = (order.shipping_state || '').toLowerCase();
        const addr = (order.shipping_address || '').toLowerCase();
        const itemTitles = (order.items || []).map((i) => i.title.toLowerCase()).join(' ');

        const matches =
          orderNum.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          addr.includes(q) ||
          itemTitles.includes(q);

        if (!matches) return false;
      }
      return true;
    });
  }, [orders, selectedStatusFilter, selectedPaymentFilter, searchQuery]);

  // Handle Quick Status Change
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

  // Open Edit Modal
  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status || 'Waiting for confirmation',
      payment_status: order.payment_status || 'Pending',
      shipping_name: order.shipping_name || order.customer_name || '',
      shipping_phone: order.shipping_phone || order.customer_phone || '',
      shipping_address1: order.shipping_address1 || order.shipping_address || '',
      shipping_address2: order.shipping_address2 || '',
      shipping_city: order.shipping_city || '',
      shipping_state: order.shipping_state || '',
      shipping_postal_code: order.shipping_postal_code || '',
      shipping_country: order.shipping_country || 'India',
      discount: Number(order.discount) || 0,
      shipping_charge: Number(order.shipping_charge) || 0,
      items: (order.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.title || 'Ordered Product',
        size: item.selectedSize || item.size || '',
        color: item.color || item.selectedColor || '',
        quantity: item.quantity || 1,
        price: Number(item.price) || 0,
        image: item.image,
      })),
    });
  };

  // Calculate Subtotal & Grand Total for edit form
  const editCalculatedSubtotal = useMemo(() => {
    if (!editForm) return 0;
    return editForm.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [editForm]);

  const editCalculatedTotal = useMemo(() => {
    if (!editForm) return 0;
    const sub = editCalculatedSubtotal;
    const disc = Number(editForm.discount) || 0;
    const ship = Number(editForm.shipping_charge) || 0;
    return Math.max(0, sub + ship - disc);
  }, [editForm, editCalculatedSubtotal]);

  // Handle Save Edit Form
  const handleSaveOrderEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editForm) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const payload = {
        status: editForm.status,
        payment_status: editForm.payment_status,
        shipping_name: editForm.shipping_name,
        shipping_phone: editForm.shipping_phone,
        shipping_address1: editForm.shipping_address1,
        shipping_address2: editForm.shipping_address2,
        shipping_city: editForm.shipping_city,
        shipping_state: editForm.shipping_state,
        shipping_postal_code: editForm.shipping_postal_code,
        shipping_country: editForm.shipping_country,
        items: editForm.items,
        subtotal: editCalculatedSubtotal,
        discount: Number(editForm.discount) || 0,
        shipping_charge: Number(editForm.shipping_charge) || 0,
        total_price: editCalculatedTotal,
      };

      const { error } = await updateOrderDetails(editingOrder.id, payload);
      if (error) throw error;

      setSuccessMsg(`Order #${editingOrder.order_number || editingOrder.id.slice(0, 8)} updated successfully!`);
      setEditingOrder(null);
      setEditForm(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update order details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await deleteOrder(orderId);
      if (error) throw error;
      setSuccessMsg('Order deleted successfully!');
      setDeletingOrderId(null);
      if (editingOrder?.id === orderId) {
        setEditingOrder(null);
        setEditForm(null);
      }
    } catch {
      setErrorMsg('Failed to delete order.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#111111] space-y-1">
          <span className="attiz-mono text-[9px] font-bold text-black/60 uppercase tracking-widest block">
            Total Orders
          </span>
          <div className="flex items-center justify-between">
            <span className="attiz-display text-2xl font-bold text-black">{metrics.totalCount}</span>
            <PackageCheck className="w-6 h-6 text-black/40" />
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#111111] space-y-1">
          <span className="attiz-mono text-[9px] font-bold text-black/60 uppercase tracking-widest block">
            Total Revenue
          </span>
          <div className="flex items-center justify-between">
            <span className="attiz-display text-2xl font-bold text-[#E63B2E]">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </span>
            <DollarSign className="w-6 h-6 text-[#E63B2E]/40" />
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#111111] space-y-1">
          <span className="attiz-mono text-[9px] font-bold text-black/60 uppercase tracking-widest block">
            Pending Processing
          </span>
          <div className="flex items-center justify-between">
            <span className="attiz-display text-2xl font-bold text-amber-600">{metrics.pendingCount}</span>
            <Clock className="w-6 h-6 text-amber-500/40" />
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#111111] space-y-1">
          <span className="attiz-mono text-[9px] font-bold text-black/60 uppercase tracking-widest block">
            Delivered Orders
          </span>
          <div className="flex items-center justify-between">
            <span className="attiz-display text-2xl font-bold text-green-700">{metrics.deliveredCount}</span>
            <CheckCircle2 className="w-6 h-6 text-green-600/40" />
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filter Options */}
      <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#111111] space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search Order #, Name, Phone, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-black/30 attiz-mono text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black uppercase font-bold"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-wider shrink-0">
              Payment:
            </span>
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="border border-black/30 p-2 attiz-mono text-xs font-bold text-black uppercase focus:outline-none bg-white cursor-pointer"
            >
              <option value="All">All Payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Status Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedStatusFilter('All')}
            className={`px-3 py-1.5 attiz-mono text-[10px] font-extrabold uppercase tracking-wider border border-black shrink-0 transition-colors ${
              selectedStatusFilter === 'All'
                ? 'bg-black text-[#FFCB05]'
                : 'bg-white text-black hover:bg-black/5'
            }`}
          >
            All Statuses ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1.5 attiz-mono text-[10px] font-extrabold uppercase tracking-wider border border-black shrink-0 transition-colors ${
                  selectedStatusFilter === status
                    ? 'bg-[#E63B2E] text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Container */}
      {dbLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black p-5 animate-pulse space-y-3"
            >
              <div className="h-4 bg-black/10 rounded w-1/3" />
              <div className="h-3 bg-black/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-black p-10 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-black/30 mx-auto" />
          <p className="attiz-mono text-xs font-bold text-black/60 uppercase tracking-widest">
            No matching customer orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrderId === order.id;
            const orderNum = order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`;
            const customerName = order.shipping_name || order.customer_name || 'Customer';
            const customerPhone = order.shipping_phone || order.customer_phone || 'No phone';

            return (
              <div
                key={order.id}
                className="bg-white border-2 border-black shadow-[3.5px_3.5px_0_0_#111111] overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-black flex flex-wrap items-center justify-between gap-3 attiz-mono text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-black uppercase tracking-wider text-sm">
                      {orderNum}
                    </span>
                    <span className="text-[10px] text-black/50 font-bold uppercase">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Status Pill */}
                    <span
                      className={`text-[9px] font-extrabold uppercase border border-black px-2 py-0.5 ${
                        order.payment_status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : order.payment_status === 'Refunded'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Payment: {order.payment_status || 'Pending'}
                    </span>

                    {/* Quick Status Select */}
                    <div className="flex items-center space-x-1">
                      {isUpdating && (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-[#E63B2E] animate-spin" />
                      )}
                      <select
                        disabled={isUpdating}
                        value={order.status || 'Waiting for confirmation'}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-[10px] font-extrabold tracking-wider border-2 border-black px-2 py-1 bg-[#FFCB05] text-black outline-none cursor-pointer uppercase"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={() => handlePushToShiprocket(order.id)}
                      disabled={pushingOrderId === order.id}
                      className="px-2.5 py-1 bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors border border-black text-[10px] font-extrabold uppercase flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Push order to Shiprocket"
                    >
                      {pushingOrderId === order.id ? (
                        <div className="w-3 h-3 border-2 border-[#FFCB05] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Truck className="w-3 h-3" />
                      )}
                      <span>{order.shiprocket_order_id ? 'Re-Sync Shiprocket' : 'Shiprocket'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(order)}
                      className="px-2.5 py-1 bg-black text-white hover:bg-[#E63B2E] transition-colors border border-black text-[10px] font-extrabold uppercase flex items-center space-x-1 cursor-pointer"
                      title="Edit Order Details"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Order</span>
                    </button>

                    <button
                      onClick={() => setDeletingOrderId(order.id)}
                      className="px-2 py-1 bg-red-100 text-[#E63B2E] hover:bg-[#E63B2E] hover:text-white transition-colors border border-black text-[10px] font-extrabold uppercase cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Order Main Content Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Customer & Address Details */}
                  <div className="md:col-span-4 space-y-1.5 attiz-mono text-xs">
                    <div className="font-extrabold text-black uppercase">
                      👤 {customerName}
                    </div>
                    <div className="text-black/70 text-[11px]">
                      📞 {customerPhone}
                    </div>
                    <div className="text-black/60 text-[10px] uppercase leading-tight pt-1">
                      📍 {order.shipping_address || 'No address specified'}
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-black/10 pt-3 md:pt-0 md:pl-4 space-y-2">
                    <span className="attiz-mono text-[9px] font-bold text-black/50 uppercase tracking-widest block">
                      Purchased Items ({order.items?.length || 0})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {order.items?.map((item, i) => (
                        <div
                          key={`${item.id || i}`}
                          className="flex items-center space-x-2 text-xs attiz-mono bg-[#FAF8F5] p-1.5 border border-black/10"
                        >
                          {item.image && item.image !== '/placeholder.png' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-7 h-8 object-cover border border-black/10 shrink-0"
                            />
                          )}
                          <div className="min-w-0 grow">
                            <span className="font-bold text-black uppercase block truncate text-[11px]">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] text-black/60">
                              {(item.selectedSize || item.size) && <span>Size: {item.selectedSize || item.size}</span>}
                              {(item.color || item.selectedColor) && <span>Color: {item.color || item.selectedColor}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-[#E63B2E] text-[11px] shrink-0">
                            ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Total Column */}
                  <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-black/10 pt-3 md:pt-0 md:pl-4 text-right space-y-1 attiz-mono">
                    <span className="text-[9px] font-bold text-black/50 uppercase tracking-widest block">
                      Grand Total
                    </span>
                    <span className="attiz-display text-xl font-bold text-[#E63B2E] block">
                      ₹{(order.total_price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-black/70 block uppercase">
                      Payment: {order.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Shiprocket Metadata Info Bar (If synced) */}
                {(order.shiprocket_order_id || order.awb_code) && (
                  <div className="px-4 py-2 bg-[#FFCB05]/15 border-t border-black/10 text-[10px] attiz-mono flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-black uppercase">🚀 Shiprocket Order ID:</span>
                      <span className="font-extrabold text-[#E63B2E]">{order.shiprocket_order_id || 'N/A'}</span>
                      {order.shiprocket_shipment_id && (
                        <span className="text-black/60">(Shipment #{order.shiprocket_shipment_id})</span>
                      )}
                    </div>
                    {order.awb_code && (
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-black">AWB:</span>
                        <span className="font-extrabold text-black bg-white px-1.5 py-0.5 border border-black">{order.awb_code}</span>
                        {order.courier_name && <span className="text-black/70">via {order.courier_name}</span>}
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E63B2E] hover:underline font-bold flex items-center gap-0.5"
                          >
                            <span>Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && editForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-[8px_8px_0_0_#111111] space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <span className="attiz-mono text-[9px] font-extrabold uppercase tracking-widest bg-black text-[#FFCB05] px-2 py-0.5">
                  Admin Order Editor
                </span>
                <h3 className="attiz-display text-xl uppercase text-black mt-1">
                  Modify Order #{editingOrder.order_number || editingOrder.id.slice(0, 8)}
                </h3>
              </div>

              <button
                onClick={() => {
                  setEditingOrder(null);
                  setEditForm(null);
                }}
                className="p-1 border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveOrderEdits} className="space-y-6 attiz-mono text-xs">
              {/* Order & Payment Status Section */}
              <div className="bg-[#FAF8F5] border-2 border-black p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1">
                    Order Fulfillment Status <span className="text-[#E63B2E]">*</span>
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold bg-white text-black focus:outline-none uppercase cursor-pointer"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1">
                    Payment Status <span className="text-[#E63B2E]">*</span>
                  </label>
                  <select
                    value={editForm.payment_status}
                    onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold bg-white text-black focus:outline-none uppercase cursor-pointer"
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Delivery Address Information */}
              <div className="space-y-3">
                <h4 className="attiz-display text-sm uppercase text-black border-b border-black/10 pb-1">
                  Recipient & Shipping Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.shipping_name}
                      onChange={(e) => setEditForm({ ...editForm, shipping_name: e.target.value })}
                      className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.shipping_phone}
                      onChange={(e) => setEditForm({ ...editForm, shipping_phone: e.target.value })}
                      className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                    Street Address Line 1
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.shipping_address1}
                    onChange={(e) => setEditForm({ ...editForm, shipping_address1: e.target.value })}
                    className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.shipping_address2}
                    onChange={(e) => setEditForm({ ...editForm, shipping_address2: e.target.value })}
                    className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.shipping_city}
                      onChange={(e) => setEditForm({ ...editForm, shipping_city: e.target.value })}
                      className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.shipping_state}
                      onChange={(e) => setEditForm({ ...editForm, shipping_state: e.target.value })}
                      className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black/80 uppercase mb-1">
                      PIN / Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.shipping_postal_code}
                      onChange={(e) => setEditForm({ ...editForm, shipping_postal_code: e.target.value })}
                      className="w-full border border-black/30 p-2 font-bold text-black uppercase focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items Table & Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-black/10 pb-1">
                  <h4 className="attiz-display text-sm uppercase text-black">
                    Modify Purchased Items ({editForm.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        items: [
                          ...editForm.items,
                          {
                            title: 'New Product Item',
                            size: 'M',
                            color: '',
                            quantity: 1,
                            price: 999,
                          },
                        ],
                      });
                    }}
                    className="px-2 py-1 bg-black text-[#FFCB05] text-[10px] font-bold uppercase flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto border border-black/15 p-2 bg-[#FAF8F5]">
                  {editForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-black/20 p-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="grow space-y-2 min-w-[200px]">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...editForm.items];
                            newItems[idx].title = e.target.value;
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          placeholder="Item Title"
                          className="w-full border border-black/20 p-1 font-bold uppercase text-xs"
                        />
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => {
                              const newItems = [...editForm.items];
                              newItems[idx].size = e.target.value;
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            placeholder="Size (e.g. M)"
                            className="w-24 border border-black/20 p-1 text-[10px] font-bold uppercase"
                          />
                          <input
                            type="text"
                            value={item.color || ''}
                            onChange={(e) => {
                              const newItems = [...editForm.items];
                              newItems[idx].color = e.target.value;
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            placeholder="Color"
                            className="w-24 border border-black/20 p-1 text-[10px] font-bold uppercase"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div>
                          <label className="block text-[8px] font-bold text-black/50 uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editForm.items];
                              newItems[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-14 border border-black/20 p-1 text-xs font-bold text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold text-black/50 uppercase">Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...editForm.items];
                              newItems[idx].price = Math.max(0, parseFloat(e.target.value) || 0);
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-20 border border-black/20 p-1 text-xs font-bold text-center"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newItems = editForm.items.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          className="p-1 bg-red-100 text-[#E63B2E] hover:bg-[#E63B2E] hover:text-white transition-colors border border-black text-xs font-bold uppercase cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recalculated Total Footer with Discount & Shipping */}
                <div className="bg-[#FAF8F5] p-3 border border-black/20 space-y-2 text-xs attiz-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-black uppercase mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.discount}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            discount: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full border border-black/30 p-1.5 font-bold text-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-black uppercase mb-1">
                        Shipping Charge (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.shipping_charge}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            shipping_charge: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full border border-black/30 p-1.5 font-bold text-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex flex-wrap justify-between items-center text-black font-bold text-xs gap-2">
                    <div>
                      <span>Subtotal: ₹{editCalculatedSubtotal.toLocaleString('en-IN')}</span>
                      {Number(editForm.discount) > 0 && (
                        <span className="text-[#E63B2E] ml-2">(-₹{Number(editForm.discount).toLocaleString('en-IN')})</span>
                      )}
                      {Number(editForm.shipping_charge) > 0 && (
                        <span className="text-black/70 ml-2">(+₹{Number(editForm.shipping_charge).toLocaleString('en-IN')})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-black/50 block uppercase">Final Payable Total</span>
                      <span className="attiz-display text-lg font-bold text-[#E63B2E]">
                        ₹{editCalculatedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOrder(null);
                    setEditForm(null);
                  }}
                  className="px-5 py-2.5 border-2 border-black bg-white text-black hover:bg-black/5 font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 border-2 border-black bg-[#E63B2E] text-white hover:bg-black font-bold uppercase transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Order Modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingOrderId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0_0_#111111] space-y-4">
            <div className="flex items-center space-x-2 text-[#E63B2E]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="attiz-display text-lg uppercase font-bold text-black">
                Confirm Delete Order
              </h3>
            </div>
            <p className="attiz-mono text-xs text-black/70 leading-relaxed uppercase">
              Are you sure you want to permanently delete this order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2 border-2 border-black bg-white text-black attiz-mono text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deletingOrderId)}
                className="px-4 py-2 border-2 border-black bg-[#E63B2E] text-white hover:bg-black attiz-mono text-xs font-bold uppercase cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
