'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Product, Category, Order, Banner } from '@/lib/types';

export type { Product, Category, Order, Banner };

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  orders: Order[];
  banners: Banner[];
  dbLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (data: Partial<Product>) => Promise<{ data: unknown; error: unknown }>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<{ data: unknown; error: unknown }>;
  deleteProduct: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addCategory: (data: Partial<Category> | Partial<Category>[]) => Promise<{ data: unknown; error: unknown }>;
  updateCategory: (id: string, updates: { name: string; parent_id?: string | null; sort_order?: number }) => Promise<{ data: unknown; error: unknown }>;
  deleteCategory: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addBanner: (data: Partial<Banner>) => Promise<{ data: unknown; error: unknown }>;
  deleteBanner: (id: string) => Promise<{ data: unknown; error: unknown }>;
  updateOrderStatus: (orderId: string, nextStatus: string) => Promise<{ data: unknown; error: unknown }>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)attiz_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function apiFetch(url: string, options?: RequestInit) {
  try {
    const sessionToken = getSessionToken();
    const headers = new Headers(options?.headers);
    if (sessionToken) headers.set('x-attiz-session', sessionToken);
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || 'Request failed' };
    return { data: json, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const refreshData = async () => {
    try {
      setDbLoading(true);
      const sessionToken = getSessionToken();
      const [prodRes, catRes, ordRes, banRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include', headers: sessionToken ? { 'x-attiz-session': sessionToken } : undefined }),
        fetch('/api/categories', { credentials: 'include', headers: sessionToken ? { 'x-attiz-session': sessionToken } : undefined }),
        fetch('/api/orders', { credentials: 'include', headers: sessionToken ? { 'x-attiz-session': sessionToken } : undefined }),
        fetch('/api/banners', { credentials: 'include', headers: sessionToken ? { 'x-attiz-session': sessionToken } : undefined }),
      ]);
      const [prodData, catData, ordData, banData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        ordRes.json(),
        banRes.json(),
      ]);
      const enrichedProducts = Array.isArray(prodData)
        ? prodData.map((p: any) => {
            const variants = p.product_variants || [];
            const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size))).join(',');
            const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color))).join(',');
            const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
            const firstVariant = variants[0];
            const price = firstVariant ? parseFloat(String(firstVariant.price)) : 0;
            const discount = firstVariant ? parseFloat(String(firstVariant.discount || 0)) : 0;
            
            const imageUrls: string[] = [];
            variants.forEach((v: any) => {
              v.product_variant_images?.forEach((img: any) => {
                if (img.image_url && !imageUrls.includes(img.image_url)) {
                  imageUrls.push(img.image_url);
                }
              });
            });
            const image = imageUrls[0] || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
            const images = imageUrls.join(',');

            return {
              ...p,
              price,
              discount,
              image,
              images,
              sizes: uniqueSizes,
              colors: uniqueColors,
              stock: totalStock,
            };
          })
        : [];
      setProducts(enrichedProducts);
      setCategories(Array.isArray(catData) ? catData : []);
      setOrders(Array.isArray(ordData) ? ordData : []);
      setBanners(Array.isArray(banData) ? banData : []);
    } catch (e) {
      console.error('Error fetching store data:', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const addProduct = async (data: Partial<Product>) => {
    const result = await apiFetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const editProduct = async (id: string, updates: Partial<Product>) => {
    const result = await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteProduct = async (id: string) => {
    const result = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addCategory = async (data: Partial<Category> | Partial<Category>[]) => {
    const result = await apiFetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const updateCategory = async (id: string, updates: { name: string; parent_id?: string | null; sort_order?: number }) => {
    const result = await apiFetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteCategory = async (id: string) => {
    const result = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addBanner = async (data: Partial<Banner>) => {
    const result = await apiFetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteBanner = async (id: string) => {
    const result = await apiFetch(`/api/banners/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    const result = await apiFetch(`/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
    if (!result.error) await refreshData();
    return result;
  };

  return (
    <StoreContext.Provider value={{
      products, categories, orders, banners, dbLoading, refreshData,
      addProduct, editProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addBanner, deleteBanner,
      updateOrderStatus,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
